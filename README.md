# NMalls Recorrência

Sistema para controle de clientes recorrentes NMalls, composto por uma extensão para Chrome e um painel web.

## Estrutura do Projeto

- `extensao/` - Extensão para Chrome para integração com Tiny ERP
- `painel/` - Aplicação web para gerenciamento de clientes recorrentes

## Requisitos

- Node.js 14+ e npm
- Banco de dados Supabase
- Chrome ou Chromium para a extensão

## Instalação

### 1. Configurar o Banco de Dados Supabase

O projeto utiliza Supabase como banco de dados. Você precisa configurar as tabelas conforme o esquema:

- `clientes`: Armazena informações dos clientes
- `produtos`: Produtos que podem ser incluídos nas recorrências
- `recorrencias`: Registros de recorrência dos clientes
- `recorrencia_produtos`: Produtos associados a cada recorrência
- `historico_compras`: Histórico de compras realizadas para cada recorrência

### 2. Configurar o Painel Web

1. Entre na pasta do painel:
   ```
   cd painel
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Crie um arquivo `.env` baseado no `.env.example`:
   ```
   cp .env.example .env
   ```

4. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   JWT_SECRET=seu_segredo_para_jwt
   JWT_EXPIRES_IN=24h
   ```

5. Inicie o servidor:
   ```
   npm run dev
   ```

6. Acesse o painel em `http://localhost:3000`

### 3. Instalar a Extensão Chrome

1. Abra o Chrome e navegue para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" no canto superior direito
3. Clique em "Carregar sem compactação" e selecione a pasta `extensao/`
4. A extensão será instalada e aparecerá na barra de ferramentas do Chrome

## Como Usar

### Painel Web

O painel web oferece as seguintes funcionalidades:

- **Dashboard**: Visão geral das estatísticas e próximas compras
- **Clientes**: Gerenciamento de clientes recorrentes
- **Recorrências**: Controle das recorrências de cada cliente
- **Produtos**: Cadastro de produtos para as recorrências

Para acessar o painel, use as credenciais padrão:
- Email: admin@nmalls.com
- Senha: senha123

### Extensão Chrome

A extensão Chrome integra-se ao Tiny ERP e permite:

1. Consultar se um cliente possui recorrências cadastradas
2. Visualizar detalhes das recorrências do cliente
3. Abrir o painel web completo com um clique

#### Como usar a extensão:

1. Navegue até uma página de vendas no Tiny ERP
2. A extensão identificará o CPF do cliente na página
3. Clique no botão "Consultar Recorrência" que aparecerá na página
4. Um popup exibirá informações sobre as recorrências do cliente
5. Se o cliente não tiver recorrências, você pode cadastrá-lo através do link no popup

## Desenvolvimento

### Estrutura de Arquivos

#### Extensão Chrome
```
extensao/
├── manifest.json     - Manifesto da extensão
├── popup.html        - HTML do popup da extensão
├── img/              - Imagens e ícones
├── css/              - Estilos CSS
└── js/               - Scripts JavaScript
    ├── popup.js      - Lógica do popup
    ├── content.js    - Script injetado nas páginas
    └── background.js - Script de background
```

#### Painel Web
```
painel/
├── server.js         - Ponto de entrada do servidor Express
├── config/           - Configurações do servidor
├── routes/           - Rotas da API
├── services/         - Serviços de negócio
└── public/           - Frontend do painel
    ├── index.html    - Página principal
    ├── css/          - Estilos CSS
    ├── js/           - Scripts JavaScript
    ├── img/          - Imagens e ícones
    ├── components/   - Componentes reutilizáveis
    └── pages/        - Páginas do painel
```

## Licença

Este projeto é proprietário e confidencial da NMalls. Todos os direitos reservados. 