FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Expor a porta que a aplicação usa
EXPOSE 3000

# Adicionar healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD node healthcheck.js

# Comando para iniciar a aplicação - com HOST 0.0.0.0 para ouvir em todas as interfaces
CMD ["node", "server.js"] 