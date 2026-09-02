const db = require('../config/db');
const logger = require('../utils/logger');

exports.handleWebhook = async (req, res) => {
    try {
        const { event, data } = req.body; 

        // Em produção, aqui verificaríamos a assinatura criptográfica (signature check) do gateway.
        
        if (event === 'payment.succeeded') {
            const { userId, planSelected, amount, durationMonths } = data;

            // Calcular nova data de expiração da assinatura
            const duration = durationMonths || 1;
            const endsAt = new Date();
            endsAt.setMonth(endsAt.getMonth() + duration);

            // Iniciar uma Transação SQL para garantir consistência total
            await db.query('BEGIN');

            // 1. Atualizar o plano e status de faturamento do utilizador
            await db.query(
                `UPDATE users 
                 SET plan = $1, 
                     subscription_status = 'active', 
                     subscription_ends_at = $2,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [planSelected, endsAt, userId]
            );

            // 2. Registrar o pagamento histórico para auditoria
            await db.query(
                `INSERT INTO payments (user_id, amount, plan, status) 
                 VALUES ($1, $2, $3, 'completed')`,
                [userId, amount, planSelected]
            );

            await db.query('COMMIT');
            
            logger.info(`Pagamento aprovado. Utilizador: ${userId} migrado para o plano ${planSelected}.`);
            return res.status(200).json({ received: true, status: 'activated' });
        }

        res.status(200).json({ received: true, message: 'Evento ignorado' });

    } catch (err) {
        await db.query('ROLLBACK');
        logger.error('Falha crítica ao processar webhook de pagamento', err);
        res.status(500).json({ error: 'Erro interno ao processar webhook' });
    }
};
