FROM nginx:alpine

# Copiar os arquivos estáticos diretamente
COPY public /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Health check simplificado
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost/health || exit 1

# Iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"] 