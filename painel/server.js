const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const os = require('os');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o servidor Express
const app = express();
const port = process.env.PORT || 3000;

// Função para obter o IP da máquina
function getServerIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorar interfaces de loopback e não IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0'; // Fallback
}

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rota de health check para monitoramento
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

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

// Rota para servir o frontend - IMPORTANTE: manter esta rota por último
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor - Modificado para ouvir em todas as interfaces (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  const serverIp = getServerIp();
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Acesse: http://${serverIp}:${port}`);
  console.log(`Para acesso externo, use o IP/domínio da VPS com a porta ${port}`);
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Algo deu errado no servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app; 