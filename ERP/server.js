/* ============================================================
   server.js
   DestinyServices OS - Servidor Backend Node.js / Express
   ============================================================ */
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// NECESSÁRIO PARA O RENDER: Confiar no proxy reverso para cookies seguros (HTTPS)
app.set('trust proxy', 1);

// Configuração de Variáveis de Ambiente com fallbacks seguros para ambiente de dev local
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const DEFAULT_PASS_HASH = crypto.createHash('sha256').update('admin123').digest('hex');
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || DEFAULT_PASS_HASH;
const SESSION_SECRET = process.env.SESSION_SECRET || 'destiny-services-secret-key-2026';

// Configuração da senha da área médica (Render Environment ou fallback 1301)
const DEFAULT_MEDICAL_PASS_HASH = crypto.createHash('sha256').update('1301').digest('hex');
const MEDICAL_PASS_HASH = process.env.MEDICAL_PASS_HASH || DEFAULT_MEDICAL_PASS_HASH;

// Configuração do PostgreSQL (Render)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware para disponibilizar o pool nas rotas
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(SESSION_SECRET));

// Servir arquivos estáticos do frontend principal
app.use(express.static(path.join(__dirname, 'public')));

/* ============================================================
   MIDDLEWARE DE AUTENTICAÇÃO DO SISTEMA PRINCIPAL
   ============================================================ */
function requireAuth(req, res, next) {
    const token = req.signedCookies.ds_auth_token;
    
    if (token && token === ADMIN_USER) {
        req.user = token;
        return next();
    }
    
    return res.status(401).json({
        authenticated: false,
        error: 'Acesso não autorizado. Faça login para continuar.'
    });
}

/* ============================================================
   MIDDLEWARE E ROTAS DE AUTENTICAÇÃO MÉDICA (ÁREA RESTRITA)
   ============================================================ */
function requireMedicalAuth(req, res, next) {
    const token = req.signedCookies.ds_medical_auth;
    
    if (token && token === 'authenticated') {
        return next();
    }
    
    return res.status(401).json({
        authenticated: false,
        error: 'Acesso não autorizado aos documentos médicos.'
    });
}

// Login da Área Médica
app.post('/api/medical/login', (req, res) => {
    const { password, pass } = req.body || {};
    const candidatePassword = password || pass;

    if (!candidatePassword) {
        return res.status(400).json({
            authenticated: false,
            error: 'Senha obrigatória.'
        });
    }

    const inputHash = crypto.createHash('sha256').update(candidatePassword).digest('hex');

    if (inputHash === MEDICAL_PASS_HASH.trim()) {
        res.cookie('ds_medical_auth', 'authenticated', {
            httpOnly: true,
            signed: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 12 * 60 * 60 * 1000 // 12 Horas de sessão
        });

        return res.status(200).json({
            authenticated: true,
            message: 'Acesso médico autorizado.'
        });
    }

    return res.status(401).json({
        authenticated: false,
        error: 'Senha incorreta.'
    });
});

// Logout da Área Médica
app.post('/api/medical/logout', (req, res) => {
    res.clearCookie('ds_medical_auth', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({
        authenticated: false,
        message: 'Sessão encerrada com sucesso.'
    });
});

// Verificar status da sessão médica
app.get('/api/medical/check', (req, res) => {
    const token = req.signedCookies.ds_medical_auth;
    if (token === 'authenticated') {
        return res.status(200).json({ authenticated: true });
    }
    return res.status(200).json({ authenticated: false });
});

/* ============================================================
   ROTAS PÚBLICAS DA API
   ============================================================ */

// Rota de Health Check / Ping
app.get('/api/ping', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Servidor DestinyServices OS operacional.',
        timestamp: new Date().toISOString()
    });
});

// Login do Usuário Principal
app.post('/api/login', (req, res) => {
    const { user, password, pass } = req.body || {};
    const candidatePassword = password || pass;

    if (!user || !candidatePassword) {
        return res.status(400).json({
            authenticated: false,
            error: 'Usuário e senha são obrigatórios.'
        });
    }

    const inputHash = crypto.createHash('sha256').update(candidatePassword).digest('hex');

    if (user.trim() === ADMIN_USER && inputHash === ADMIN_PASS_HASH.trim()) {
        res.cookie('ds_auth_token', ADMIN_USER, {
            httpOnly: true,
            signed: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 Horas
        });

        return res.status(200).json({
            authenticated: true,
            user: ADMIN_USER,
            message: 'Autenticação realizada com sucesso.'
        });
    }

    return res.status(401).json({
        authenticated: false,
        error: 'Usuário ou senha incorretos.'
    });
});

// Checar estado da autenticação principal
app.get('/api/me', (req, res) => {
    const token = req.signedCookies.ds_auth_token;

    if (token && token === ADMIN_USER) {
        return res.status(200).json({
            authenticated: true,
            user: token
        });
    }

    return res.status(200).json({
        authenticated: false,
        user: null
    });
});

// Realizar Logout principal
app.post('/api/logout', (req, res) => {
    res.clearCookie('ds_auth_token', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({
        authenticated: false,
        message: 'Sessão encerrada com sucesso.'
    });
});

/* ============================================================
   EXEMPLO DE ROTAS DE API PROTEGIDAS (Middleware requireAuth)
   ============================================================ */
app.get('/api/protected/data', requireAuth, (req, res) => {
    res.status(200).json({
        message: 'Acesso concedido a dados confidenciais do servidor.',
        user: req.user
    });
});

/* ============================================================
   ROTEAMENTO SEGURO DA ÁREA MÉDICA (/medical)
   ============================================================ */
// Servir arquivos confidenciais (PDFs de exames, laudos) com proteção de autenticação obrigatória
app.use('/medical/docs', requireMedicalAuth, express.static(path.join(__dirname, 'private_medical')));

// Servir os arquivos estáticos do SPA médico
app.use('/medical', express.static(path.join(__dirname, 'medical_spa')));

// Fallback de rotas internas do SPA médico (Client-side routing)
app.get('/medical/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'medical_spa', 'index.html'));
});

/* ============================================================
   ROTEAMENTO SPA GERAL (Single Page Application Fallback)
   ============================================================ */
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

/* ============================================================
   INICIALIZAÇÃO DO SERVIDOR
   ============================================================ */
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` DestinyServices OS rodando com sucesso!`);
    console.log(` Porta: ${PORT}`);
    console.log(` Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Acesse em: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
