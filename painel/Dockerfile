FROM node:16-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Aumentar a memória disponível para o Node.js
ENV NODE_OPTIONS=--max_old_space_size=4096

# Copiar o restante do código
COPY . .

# Expor a porta que a aplicação usa
EXPOSE 3000

# Adicionar healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação - com HOST 0.0.0.0 para ouvir em todas as interfaces
CMD ["node", "server.js"] 