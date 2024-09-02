type TCompra = {
    id: string;
    id_usuario: string;
    id_evento: string;
  };
  
  export type TCompraComDetalhes = {
    data: string;
    endereco: string;
    idCompra: string;
    idEvento: string;
    nome: string;
    preco: number;
  };
  
  export default TCompra;
  