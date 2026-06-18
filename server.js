const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// Mapeamento de MIME types para extensões comuns
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

const server = http.createServer((req, res) => {
  let url = req.url;

  // Redireciona a raiz para ./dsbrti/index.html
  if (url === "/") {
    res.writeHead(302, { Location: "/dsbrti/index.html" });
    res.end();
    return;
  }

  // Decodifica a URL e resolve o caminho absoluto do arquivo
  const decodedUrl = decodeURIComponent(url);
  const filePath = path.join(__dirname, decodedUrl);

  // Garante que o caminho está dentro do diretório do projeto (segurança)
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // Tenta ler o arquivo
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404 - Arquivo não encontrado</h1>");
      } else {
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>500 - Erro interno do servidor</h1>");
      }
      return;
    }

    // Define o Content-Type com base na extensão
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
