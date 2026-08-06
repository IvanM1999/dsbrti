// server.js

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT_DIR = __dirname;

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

// HTML da Tela de Loading/Splash do ERP
const LOADING_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciando ERP - Destiny Services TI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #0F172A;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #F8FAFC;
      overflow: hidden;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .spinner {
      transform-origin: center;
      animation: spin 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    .pulse {
      transform-origin: center;
      animation: corePulse 1.5s ease-in-out infinite alternate;
    }
    .status-text {
      font-size: 13px;
      letter-spacing: 4px;
      color: #38BDF8;
      font-weight: 700;
      text-transform: uppercase;
      animation: blink 1.2s infinite alternate;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes corePulse { 0% { transform: scale(0.95); opacity: 0.8; } 100% { transform: scale(1.05); opacity: 1; } }
    @keyframes blink { 0% { opacity: 0.4; } 100% { opacity: 1; } }
  </style>
</head>
<body>
  <div class="loading-container">
    <!-- SVG de Loading Animado -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="120" height="120">
      <defs>
        <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563EB" />
          <stop offset="50%" stop-color="#06B6D4" />
          <stop offset="100%" stop-color="#10B981" />
        </linearGradient>
      </defs>

      <!-- Anel Circundante -->
      <circle class="spinner" cx="100" cy="100" r="70" 
              fill="none" stroke="url(#loadGrad)" stroke-width="6" 
              stroke-linecap="round" stroke-dasharray="240 90" />

      <!-- Monograma "D" -->
      <g class="pulse">
        <path d="M80 65 L100 65 C120 65 135 80 135 100 C135 120 120 135 100 135 L80 135 Z" 
              fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round" />
      </g>
    </svg>

    <div class="status-text" id="status">Carregando ERP...</div>
  </div>

  <script>
    // Controla a transição e simula carregamento dos módulos
    const statusEl = document.getElementById('status');
    const steps = [
      "Iniciando Serviços...",
      "Autenticando Sessão...",
      "Carregando Módulos do ERP..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        statusEl.innerText = steps[currentStep];
        currentStep++;
      } else {
        clearInterval(interval);
        // Redireciona para a landing/index real do ERP
        window.location.href = "/dsbrti/index.html";
      }
    }, 800);
  </script>
</body>
</html>
`;

const sendFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

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

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(requestUrl.pathname);

  // 1. Rota de entrada principal exibe o Loading
  if (pathname === "/" || pathname === "/dsbrti") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(LOADING_HTML);
    return;
  }

  // 2. Servidor estático padrão para os arquivos reais
  const normalizedPath = pathname.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT_DIR, normalizedPath || ".");

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
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

    if (stats.isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(302, { Location: `${pathname}/` });
        res.end();
        return;
      }

      const indexPath = path.join(filePath, "index.html");
      sendFile(res, indexPath);
      return;
    }

    sendFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
