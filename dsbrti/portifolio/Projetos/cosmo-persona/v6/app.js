/**
 * Adições para o app.js (ou arquivo de rotas/serviços correspondente)
 * Integrado para uso com PostgreSQL no Render.com (variável de ambiente DATABASE_URL)
 */

const { Pool } = require('pg');

// Configuração da conexão com o banco de dados integrado do Render.com
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Inicializa a tabela de currículos no banco de dados se ela não existir
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
    console.log("Banco de dados conectado e tabela 'curriculos_salvos' verificada com sucesso.");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}

// Chame esta função na inicialização do app
initDatabase();

/**
 * Serviço para salvar um novo currículo gerado pelo formulário
 */
async function salvarCurriculo(dados) {
  const { modelo, nome, cargo, email, telefone, localizacao, linkedin, resumo, experiencias, habilidades } = dados;
  
  const query = `
    INSERT INTO curriculos_salvos 
    (modelo, nome, cargo, email, telefone, localizacao, linkedin, resumo, dados_extras)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, criado_em;
  `;
  
  const dadosExtras = JSON.stringify({ experiencias, habilidades });
  const values = [modelo, nome, cargo, email, telefone, localizacao, linkedin, resumo, dadosExtras];

  try {
    const result = await pool.query(query, values);
    return { success: true, id: result.rows[0].id, criado_em: result.rows[0].criado_em };
  } catch (error) {
    console.error("Erro ao salvar currículo:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Serviço para buscar um currículo salvo pelo ID (útil para renderizar dinamicamente depois)
 */
async function buscarCurriculoPorId(id) {
  const query = `SELECT * FROM curriculos_salvos WHERE id = $1;`;
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length > 0) {
      return { success: true, data: result.rows[0] };
    }
    return { success: false, message: "Currículo não encontrado." };
  } catch (error) {
    console.error("Erro ao buscar currículo:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  pool,
  salvarCurriculo,
  buscarCurriculoPorId
};
