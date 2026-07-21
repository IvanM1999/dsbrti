/**
 * Módulo de Currículos - /dsbrti/portifolio/Projetos/cosmo-persona/v6/app.js
 * Integrado para PostgreSQL (Render.com) + Rotas Express
 */

const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

// Configuração da conexão com o banco de dados do Render.com
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Inicializa a tabela de currículos no banco de dados se não existir
 */
async function initDatabase() {
  const query = `
    CREATE TABLE IF NOT EXISTS curriculos_salvos (
      id SERIAL PRIMARY KEY,
      modelo VARCHAR(50) NOT NULL,
      nome VARCHAR(100) NOT NULL,
      cargo VARCHAR(100),
      email VARCHAR(100),
      telefone VARCHAR(50),
      localizacao VARCHAR(100),
      linkedin VARCHAR(150),
      resumo TEXT,
      dados_extras JSONB,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("[CV App] Banco de dados conectado e tabela 'curriculos_salvos' verificada.");
  } catch (error) {
    console.error("[CV App] Erro ao inicializar o banco de dados:", error);
  }
}

// Inicializa a tabela ao carregar o módulo
initDatabase();

/**
 * Função utilitária: Salvar currículo no DB
 */
async function salvarCurriculo(dados) {
  const { modelo, nome, cargo, email, telefone, localizacao, linkedin, resumo, experiencias, habilidades } = dados;

  const query = `
    INSERT INTO curriculos_salvos 
    (modelo, nome, cargo, email, telefone, localizacao, linkedin, resumo, dados_extras)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, criado_em;
  `;

  // O driver pg converte objetos JS diretamente para JSONB
  const dadosExtras = { experiencias: experiencias || [], habilidades: habilidades || [] };
  const values = [modelo, nome, cargo, email, telefone, localizacao, linkedin, resumo, dadosExtras];

  const result = await pool.query(query, values);
  return { id: result.rows[0].id, criado_em: result.rows[0].criado_em };
}

/**
 * Função utilitária: Buscar currículo por ID
 */
async function buscarCurriculoPorId(id) {
  const query = `SELECT * FROM curriculos_salvos WHERE id = $1;`;
  const result = await pool.query(query, [id]);

  if (result.rows.length > 0) {
    return result.rows[0];
  }
  return null;
}

/* ==========================================================================
   ROTAS EXPRESS DO SERVIÇO (Consumidas pelo formulário e visualizador)
   ========================================================================== */

// POST /api/curriculos - Criar novo currículo
router.post('/', async (req, res) => {
  try {
    const { modelo, nome } = req.body;

    if (!modelo || !nome) {
      return res.status(400).json({ 
        success: false, 
        message: 'Os campos "modelo" e "nome" são obrigatórios.' 
      });
    }

    const resultado = await salvarCurriculo(req.body);
    return res.status(201).json({
      success: true,
      id: resultado.id,
      criado_em: resultado.criado_em
    });
  } catch (error) {
    console.error('[CV App] Erro ao salvar currículo:', error);
    return res.status(500).json({ success: false, error: 'Erro interno ao salvar os dados.' });
  }
});

// GET /api/curriculos/:id - Buscar currículo por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido.' });
    }

    const curriculo = await buscarCurriculoPorId(id);
    if (!curriculo) {
      return res.status(404).json({ success: false, message: 'Currículo não encontrado.' });
    }

    return res.status(200).json({ success: true, data: curriculo });
  } catch (error) {
    console.error('[CV App] Erro ao buscar currículo:', error);
    return res.status(500).json({ success: false, error: 'Erro interno ao recuperar os dados.' });
  }
});

module.exports = {
  router,
  pool,
  salvarCurriculo,
  buscarCurriculoPorId
};
