/* ============================================================
   Caminho: DestinyServicesBR_os_erp/server.js
   Servidor Backend Node.js / Express com Rotas Completas
   ============================================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_COMPANY = {
    nomeEmpresa: 'Ivan Montibeller',
    razaoSocial: 'Destiny Services TI & Destiny ServicesBR',
    cnpj: '45.609.430/0001-43',
    telefone: '',
    endereco: ''
};
const DATA_DIR = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(__dirname, 'data');
const DATA_FILE = process.env.DB_PATH || path.join(DATA_DIR, 'db.json');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ============================================================
   BANCO DE DADOS PERSISTIDO EM ARQUIVO JSON
   ============================================================ */
function getInitialData() {
    return {
        empresa: { ...DEFAULT_COMPANY },
        clientes: [
            { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 98765-4321', endereco: 'Rua A, 123' }
        ],
        estoque: [
            { id: 1, nome: 'SSD 480GB', quantidade: 10, preco: 250.00 }
        ],
        financeiro: [
            { id: 1, descricao: 'Manutenção de Computador', valor: 150.00, tipo: 'receita', data: '2026-07-20' }
        ],
        os: [
            { id: 1, clienteId: 1, clienteNome: 'João Silva', equipamento: 'Notebook Dell', defeito: 'Não liga', status: 'pendente', valorTotal: 150.00, data: '2026-07-20' }
        ]
    };
}

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(getInitialData(), null, 2));
    }

    const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const normalized = {
        ...getInitialData(),
        ...rawData,
        empresa: {
            ...DEFAULT_COMPANY,
            ...(rawData.empresa || {})
        },
        clientes: rawData.clientes || [],
        estoque: rawData.estoque || [],
        financeiro: rawData.financeiro || [],
        os: rawData.os || []
    };

    if (!fs.existsSync(DATA_FILE) || JSON.stringify(rawData) !== JSON.stringify(normalized)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2));
    }

    return normalized;
}

function saveDb(db) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

const db = ensureDataFile();

/* ============================================================
   ROTAS DA API
   ============================================================ */

// Status do Servidor
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configurações da empresa
app.get('/api/config', (req, res) => {
    res.json({ empresa: db.empresa });
});

app.post('/api/config', (req, res) => {
    const empresa = {
        ...db.empresa,
        ...req.body
    };
    db.empresa = empresa;
    saveDb(db);
    res.json({ empresa });
});

// Dashboard
app.get('/api/dashboard', (req, res) => {
    const receitas = db.financeiro
        .filter(f => f.tipo === 'receita')
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

    res.json({
        clientes: db.clientes.length,
        os: db.os.length,
        receitas: receitas
    });
});

// --- CLIENTES ---
app.get('/api/clientes', (req, res) => res.json(db.clientes));

app.post('/api/clientes', (req, res) => {
    const novo = { id: Date.now(), ...req.body };
    db.clientes.push(novo);
    saveDb(db);
    res.status(201).json(novo);
});

app.delete('/api/clientes/:id', (req, res) => {
    const id = Number(req.params.id);
    db.clientes = db.clientes.filter(c => c.id !== id);
    saveDb(db);
    res.json({ success: true });
});

// --- ESTOQUE ---
app.get('/api/estoque', (req, res) => res.json(db.estoque));

app.post('/api/estoque', (req, res) => {
    const novo = { id: Date.now(), ...req.body };
    db.estoque.push(novo);
    saveDb(db);
    res.status(201).json(novo);
});

app.delete('/api/estoque/:id', (req, res) => {
    const id = Number(req.params.id);
    db.estoque = db.estoque.filter(e => e.id !== id);
    saveDb(db);
    res.json({ success: true });
});

// --- FINANCEIRO ---
app.get('/api/financeiro', (req, res) => res.json(db.financeiro));

app.post('/api/financeiro', (req, res) => {
    const novo = { id: Date.now(), ...req.body };
    db.financeiro.push(novo);
    saveDb(db);
    res.status(201).json(novo);
});

app.delete('/api/financeiro/:id', (req, res) => {
    const id = Number(req.params.id);
    db.financeiro = db.financeiro.filter(f => f.id !== id);
    saveDb(db);
    res.json({ success: true });
});

// --- ORDENS DE SERVIÇO (OS) ---
app.get('/api/os', (req, res) => res.json(db.os));

app.post('/api/os', (req, res) => {
    const novaOS = { id: Date.now(), status: 'pendente', ...req.body };
    db.os.push(novaOS);
    saveDb(db);
    res.status(201).json(novaOS);
});

app.delete('/api/os/:id', (req, res) => {
    const id = Number(req.params.id);
    db.os = db.os.filter(o => o.id !== id);
    saveDb(db);
    res.json({ success: true });
});

/* ============================================================
   ROTEAMENTO SPA
   ============================================================ */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor ERP operando em: http://localhost:${PORT}`);
});
