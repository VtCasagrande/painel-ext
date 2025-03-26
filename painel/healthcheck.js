const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000
};

const healthCheck = http.request(options, (res) => {
  console.log(`HEALTH CHECK STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);  // Sucesso
  } else {
    process.exit(1);  // Falha
  }
});

healthCheck.on('error', (err) => {
  console.error('HEALTH CHECK FALHOU:', err);
  process.exit(1);  // Falha
});

healthCheck.end(); 