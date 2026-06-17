const db = require('../config/db');
const logger = require('./logger');

const audit = {
    async log(userId, action, req, details = {}) {
        const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'SYSTEM';
        
        try {
            await db.query(
                `INSERT INTO audit_logs (user_id, action, ip_address, details) 
                 VALUES ($1, $2, $3, $4)`,
                [userId, action, ip, JSON.stringify(details)]
            );
        } catch (err) {
            // Se falhar o log de auditoria no banco, registramos imediatamente em arquivo para segurança
            logger.error(`FALHA CRÍTICA AO GRAVAR LOG DE AUDITORIA: [${action}] para usuário [${userId}]`, err);
        }
    }
};

module.exports = audit;
