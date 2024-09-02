import "dotenv/config";
import express from "express";
import rotas, {mensagem, validarMaxPreco, eventosFiltro, cadastrar, login, autenticarComprovante, fazerCompra, listarCompra, cancelarCompra} from "./rotas";

const app = express();

app.use(express.json());
app.get('/', mensagem);

app.use(validarMaxPreco);
app.get('/eventos', eventosFiltro);

app.post('/usuarios', cadastrar);
app.post('/login', login);

app.use('/compras', autenticarComprovante)

app.post('/compras', fazerCompra);
app.get('/compras', listarCompra);

app.delete('/compras/:id', cancelarCompra);

export default app;
