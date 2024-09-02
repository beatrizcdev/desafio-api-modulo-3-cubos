
const criptografarSenha = (senha: string): string => {
    // invertendo a senha primeiro

    const criandoArray = senha.split('')
    const palavraInvertida = criandoArray.reverse().join('')

    //adicionando prefixo e sufixo

    const prefixo = 'zz'
    const sufixo = 'yy'
    const senhaCriptografada = prefixo.concat(palavraInvertida).concat(sufixo)

    //retornando senha criptografada

    return senhaCriptografada
}

export default criptografarSenha