# ERP_dsbrti (DestinyServicesBR_os_erp)

Este é um ERP minimamente funcional e sem simulação criado com Node.js, Express e SQLite.

## Como Iniciar

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
4. Acesse via navegador em: `http://localhost:3000`

## Estrutura

- **Backend**: Express e SQLite3 (`server.js`), cria e gerencia o banco de dados `database.sqlite`.
- **Frontend**: Single Page Application nativa em JS (Modules ES6). Localizada em `public/`.
- **PWA**: Contém manifesto e service worker.
