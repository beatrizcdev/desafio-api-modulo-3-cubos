import { Router, Request, Response, NextFunction } from "express";
import bancoDeDados from "./bancoDeDados";
import criptografarSenha from "./auxiliares/criptografia";
import fraseSecreta from "./fraseSecreta";
import { v4 as uuidv4 } from "uuid";
import {TCompraComDetalhes} from "./tipos/Compra";
import TEvento from "./tipos/Evento";

const rotas = Router();


export function mensagem(req: Request, res: Response){
    const mensagemOk = 'API de vendas de ingressos'
    return res.status(200).json({mensagem: mensagemOk})
}

export function validarMaxPreco(req: Request, res: Response, next: NextFunction){
    const maxPreco = req.query.maxPreco as string

    if(maxPreco === undefined){
        return next()
    }

    if(!/^\d+$/.test(maxPreco) || Number(maxPreco) < 0){
        return res.status(400).json({
            mensagem: "O preço máximo do evento deve conter apenas números e deve ser positivo"
        })
    }

    req.maxPreco = Number(maxPreco)
    next()
}

export function eventosFiltro(req: Request, res: Response){

    let resultado = bancoDeDados.eventos
      
    if (req.maxPreco !== undefined) {
        resultado = resultado.filter((evento) => {return evento.preco <= Number(req.maxPreco)})
            
    }
      
    if (resultado.length === 0) {
        return res.status(204).send()
    }else{
      
    res.status(200).json(resultado)
    }
}

export function cadastrar(req: Request, res: Response) {
    const {email, senha, nome} = (req.body)

    //o email já está cadastrado?

    if(!email ||!senha ||!nome){
        return res.status(400).json({
            mensagem: "Todos os campos são obrigatórios"
        })
    }

    const usuarioExistente = bancoDeDados.usuarios.find((user) => user.email === email);
    if (usuarioExistente) {
        return res.status(400).json({
            mensagem: "E-mail já cadastrado"
        });
    }

    //cadastro

    const senhaCriptografada = criptografarSenha(senha)

    const novoUsuario = {
        id: uuidv4(),
        nome,
        email,
        senha: senhaCriptografada
    }

    bancoDeDados.usuarios.push(novoUsuario)

    //retornar sem senha

    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    return res.status(201).json(usuarioSemSenha)
}

export function login(req: Request, res: Response) {
    const{email, senha} = req.body

    //vendo se recebeu os dados

    if(!email || !senha){
        return res.status(400).json({mensagem: "Todos os campos são obrigatórios"})
    }

    //achar o email do usuario

    const usuario = bancoDeDados.usuarios.find((user) => user.email === email)

    if(usuario && usuario.senha === criptografarSenha(senha)){
        const comprovante = `${fraseSecreta}/${usuario.id}`
        return res.status(200).json({comprovante})
    }else{
        return res.status(400).json({mensagem: "E-mail ou senha inválidos"})
    }
    
}

export function autenticarComprovante(req: Request, res: Response, next: NextFunction) {
    const comprovante = req.query.comprovante as string

    if(!comprovante){
        return res.status(401).json({
            mensagem: "Falha na autenticação"
        })
    }

    const [fraseSecreta, id_usuario] = comprovante.split('/')

    //verificação da frase secreta 
    if(fraseSecreta !== 'fraseSecretaQueComprovaLogin'){
        return res.status(401).json({
            mensagem: "Falha na autenticação"
        })
    }

    const usuario = bancoDeDados.usuarios.find((user) => user.id === id_usuario)

    if(!usuario){
        return res.status(401).json({
            mensagem: 'Falha na autenticação'
        })
    }
    
    req.user = usuario
    next()
}

export function fazerCompra(req: Request, res: Response) {
    const {idEvento} = req.body
    const {user} = req

    if(!idEvento){
        return res.status(400).json({
            mensagem: "O identificador do evento é obrigatório"
        })
    }

    const evento = bancoDeDados.eventos.find((evento) => evento.id === idEvento)

    if(!evento){
        return res.status(404).json({
            mensagem: "Evento não encontrado"
        })
    }

    const novaCompra = {
        id: uuidv4(),
        id_usuario: user.id,
        id_evento: idEvento
        
    }

    bancoDeDados.compras.push(novaCompra)

    return res.status(201).json({
        id: novaCompra.id,
        id_usuario: novaCompra.id_usuario,
        id_evento: novaCompra.id_evento
    })

}

export function listarCompra(req: Request, res: Response){
    const usuarioId = (req.user as { id: string})?.id

    if (!usuarioId) {
        return res.status(400).json({ error: 'Usuário não autenticado' })
    }

    const compras: TCompraComDetalhes[] = bancoDeDados.compras.filter((compra) => compra.id_usuario === usuarioId).map(function(compra) {

        const evento: TEvento | undefined = bancoDeDados.eventos.find((evento) => {return evento.id === compra.id_evento})

        return{
                data: evento?.data || 'N/A',
                endereco: evento?.endereco || 'N/A',
                idCompra: compra.id,
                idEvento: compra.id_evento,
                nome: evento?.nome || 'N/A',
                preco: evento?.preco || 0  
        }

    })

    if (compras.length === 0) {
        return res.status(200).send()
    }

    return res.status(200).json(compras)
}

export function cancelarCompra(req: Request, res: Response){
    const {id} = req.params
    const {user} = req

    const indexCompra = bancoDeDados.compras.findIndex((compra) => compra.id === id && compra.id_usuario === user.id)

    if(indexCompra === -1) {
        return res.status(404).json({
            mensagem: "Compra não encontrada"
        })
    }

    bancoDeDados.compras.splice(indexCompra, 1)

    return res.status(204).send()
}


export default rotas;