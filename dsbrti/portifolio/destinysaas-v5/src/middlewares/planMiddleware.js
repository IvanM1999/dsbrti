const logger = require('../utils/logger');

exports.requirePlan = (allowedPlans) => {
    return (req, res, next) => {
        // req.user já vem populado pelo verifyToken anterior
        const { plan, subscription_status, trial_ends_at, subscription_ends_at } = req.user;
        const now = new Date();

        // 1. Admin tem acesso livre e irrestrito
        if (req.userRole === 'admin') {
            return next();
        }

        // 2. Verificar se o plano do utilizador está na lista permitida
        if (!allowedPlans.includes(plan)) {
            return res.status(403).json({ 
                status: 'error', 
                code: 'FORBIDDEN', 
                message: `Esta funcionalidade requer o plano: ${allowedPlans.join(', ')}` 
            });
        }

        // 3. Validação do Período de Trial
        if (subscription_status === 'trialing') {
            if (new Date(trial_ends_at) < now) {
                logger.security(`Tentativa de acesso com Trial expirado.`, req.ip, req.userId);
                return res.status(402).json({
                    status: 'error',
                    code: 'TRIAL_EXPIRED',
                    message: 'O seu período de teste grátis de 7 dias terminou. Adicione um método de pagamento para continuar.'
                });
            }
            return next(); // Trial ativo
        }

        // 4. Validação de Assinatura Ativa
        if (subscription_status === 'active') {
            if (subscription_ends_at && new Date(subscription_ends_at) < now) {
                return res.status(402).json({
                    status: 'error',
                    code: 'PAYMENT_REQUIRED',
                    message: 'Sua assinatura expirou. Regularize o pagamento para reativar o acesso.'
                });
            }
            return next(); // Assinatura paga e em dia
        }

        // 5. Bloqueio padrão para qualquer outro status irregular (ex: past_due, canceled)
        return res.status(402).json({
            status: 'error',
            code: 'PAYMENT_REQUIRED',
            message: 'Sua assinatura não está ativa. Por favor, aceda à página de planos.'
        });
    };
};
