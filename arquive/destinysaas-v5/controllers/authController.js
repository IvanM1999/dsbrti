const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Auxiliar para gerar Access Token
const generateAccessToken = (userId, role) => {
    return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Gerar e registrar Refresh Token
const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Válido por 7 dias

    await db.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
    );

    return token;
};

// Rota de Atualização (Refresh)
exports.refreshSession = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ status: 'error', code: 'INVALID_INPUT', message: 'Refresh Token em falta.' });
    }

    try {
        // Verificar se o token existe e não expirou
        const result = await db.query(
            `SELECT rt.*, u.role FROM refresh_tokens rt 
             JOIN users u ON rt.user_id = u.id 
             WHERE rt.token = $1 AND rt.expires_at > CURRENT_TIMESTAMP`,
            [refreshToken]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'Sessão inválida ou expirada.' });
        }

        const session = result.rows[0];

        // ──> ROTAÇÃO DE TOKEN (Opcional & Altamente Seguro): Deletar o antigo e gerar um novo
        await db.query('DELETE FROM refresh_tokens WHERE id = $1', [session.id]);

        const newAccessToken = generateAccessToken(session.user_id, session.role);
        const newRefreshToken = await generateRefreshToken(session.user_id);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        res.status(500).json({ status: 'error', code: 'DB_ERROR', message: 'Falha ao renovar sessão.' });
    }
};
