// server.js

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// TEMPO DE EXPIRAÇÃO DE SESSÃO: 30 MINUTOS
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;  // 30 minutos em ms
const SESSION_TIMEOUT_SEC = 30 * 60;        // 30 minutos em segundos (1800s)

// CREDENCIAIS E SEGREDO EXTRAÍDOS DAS VARIÁVEIS DO RENDER
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "SenhaForteDefinaNoRender123!";
// Caso não definida nas vars, gera uma chave aleatória criptograficamente segura de 32 bytes
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

// RATE LIMITER (MEMÓRIA) - Prevenção contra Ataques DoS e Força Bruta
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS_PER_WINDOW = 100;

function isRateLimited(ip) {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > userData.resetTime) {
    userData.count = 1;
    userData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    userData.count++;
  }

  rateLimitMap.set(ip, userData);
  return userData.count > MAX_REQUESTS_PER_WINDOW;
}

// MIME TYPES
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// UTILITÁRIO DE SESSÃO / COOKIES HTTP-ONLY
function signToken(username) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ 
    sub: username, 
    exp: Date.now() + SESSION_TIMEOUT_MS 
  })).toString("base64url");
  
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  
  if (signature !== expectedSignature) return false;

  try {
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decodedPayload.exp < Date.now()) return false;
    return true;
  } catch (err) {
    return false;
  }
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });
  }
  return list;
}

// TELA DE LOGIN HTML EMBUTIDA
const LOGIN_HTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - ERP Destiny Services TI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #0F172A;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #F8FAFC;
    }
    .login-card {
      background: #1E293B;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      width: 100%;
      max-width: 400px;
      border: 1px solid #334155;
    }
    h2 { margin-bottom: 20px; text-align: center; color: #38BDF8; font-weight: 600; }
    .form-group { margin-bottom: 18px; }
    label { display: block; margin-bottom: 6px; font-size: 14px; color: #94A3B8; }
    input {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #475569;
      background: #0F172A;
      color: #FFF;
      font-size: 14px;
      outline: none;
    }
    input:focus { border-color: #38BDF8; }
    button {
      width: 100%;
      padding: 12px;
      background: #2563EB;
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      font-size: 15px;
      transition: background 0.2s;
    }
    button:hover { background: #1D4ED8; }
    .error-msg { color: #EF4444; font-size: 13px; margin-top: 10px; text-align: center; display: none; }
    .info-msg { color: #F59E0B; font-size: 13px; margin-bottom: 15px; text-align: center; display: none; }
  </style>
</head>
<body>
  <div class="login-card">
    <h2>ERP Destiny Services TI</h2>
    <div id="sessionNotice" class="info-msg">Sua sessão expirou por inatividade. Faça login novamente.</div>
    <form id="loginForm">
      <div class="form-group">
        <label>Usuário</label>
        <input type="text" id="username" required autocomplete="username">
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input type="password" id="password" required autocomplete="current-password">
      </div>
      <button type="submit">Entrar no Sistema</button>
      <div id="error" class="error-msg">Usuário ou senha inválidos.</div>
    </form>
  </div>

  <script>
    // Mostra aviso se foi redirecionado por inatividade
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reason') === 'expired') {
      document.getElementById('sessionNotice').style.display = 'block';
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value;
      const pass = document.getElementById('password').value;
      const errorEl = document.getElementById('error');

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });

      if (res.ok) {
        window.location.href = "/erp";
      } else {
        errorEl.style.display = "block";
      }
    });
  </script>
</body>
</html>
`;

// ENVIAR ARQUIVOS ESTÁTICOS
const sendFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<h1>${err.code === "ENOENT" ? "404 - Não encontrado" : "500 - Erro Interno"}</h1>`);
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
};

// SERVIDOR HTTP PRINCIPAL
const server = http.createServer((req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // 1. SECURITY HEADERS
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // 2. BLOQUEIO DE RATE LIMITING
  if (isRateLimited(clientIp)) {
    res.writeHead(429, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Muitas requisições originadas do mesmo IP. Tente novamente em 15 minutos.");
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(requestUrl.pathname);

  // 3. ROTA DE HEALTH CHECK (Render / UptimeRobot)
  if (pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }

  // 4. ROTA DE LOGIN (TELA)
  if (pathname === "/login") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(LOGIN_HTML);
    return;
  }

  // 5. API DE LOGIN (AUTENTICAÇÃO)
  if (pathname === "/api/login" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const { user, pass } = JSON.parse(body);
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
          const token = signToken(user);
          res.writeHead(200, {
            "Set-Cookie": `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TIMEOUT_SEC}`,
            "Content-Type": "application/json"
          });
          res.end(JSON.stringify({ status: "success" }));
        } else {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "unauthorized" }));
        }
      } catch (e) {
        res.writeHead(400);
        res.end("Bad Request");
      }
    });
    return;
  }

  // 6. ROTA DE LOGOUT
  if (pathname === "/logout" || (pathname === "/api/logout" && req.method === "POST")) {
    res.writeHead(302, {
      "Set-Cookie": "auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      "Location": "/login"
    });
    res.end();
    return;
  }

  // 7. ROTA PROTEGIDA: /erp e subrotas
  if (pathname === "/erp" || pathname.startsWith("/dsbrti")) {
    const cookies = parseCookies(req);
    const isAuthenticated = verifyToken(cookies.auth_token);

    if (!isAuthenticated) {
      res.writeHead(302, { Location: "/login?reason=expired" });
      res.end();
      return;
    }

    if (pathname === "/erp") {
      res.writeHead(302, { Location: "/dsbrti/index.html" });
      res.end();
      return;
    }
  }

  // 8. ROTA RAIZ
  if (pathname === "/") {
    res.writeHead(302, { Location: "/login" });
    res.end();
    return;
  }

  // SERVIDOR ESTÁTICO DE ARQUIVOS
  const normalizedPath = pathname.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT_DIR, normalizedPath || ".");

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 - Arquivo Não Encontrado</h1>");
      return;
    }

    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      sendFile(res, indexPath);
      return;
    }

    sendFile(res, filePath);
  });
});

// MANTER SERVIÇO ATIVO NO RENDER
const startKeepAlive = () => {
  const serviceUrl = process.env.RENDER_EXTERNAL_URL;
  if (!serviceUrl) return;

  const pingUrl = `${serviceUrl}/healthz`;
  setInterval(() => {
    https.get(pingUrl, (res) => {
      console.log(`[Keep-Alive] Ping: ${res.statusCode}`);
    }).on("error", () => {});
  }, 10 * 60 * 1000);
};

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startKeepAlive();
});
