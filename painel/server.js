const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o servidor Express
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Importar rotas
const clientesRoutes = require('./routes/clientes');
const recorrenciasRoutes = require('./routes/recorrencias');
const produtosRoutes = require('./routes/produtos');
const authRoutes = require('./routes/auth');

// Usar rotas
app.use('/api/clientes', clientesRoutes);
app.use('/api/recorrencias', recorrenciasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/auth', authRoutes);

// Rota para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Algo deu errado no servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app; 