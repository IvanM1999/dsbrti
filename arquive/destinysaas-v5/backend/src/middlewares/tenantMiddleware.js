const db = require('../config/db');
const logger = require('../utils/logger');

exports.resolveTenant = async (req, res, next) => {
    // O Tenant pode ser identificado pelo header ou pelo subdomínio de origem
    const tenantIdentifier = req.headers['x-tenant-id'] || req.headers['host'].split('.')[0];

    if (!tenantIdentifier) {
        return res.status(400).json({
            status: 'error',
            code: 'TENANT_MISSING',
            message: 'Identificador corporativo em falta na requisição.'
        });
    }

    try {
        // Procurar o tenant ativo na base de dados
        const tenantResult = await db.query(
            'SELECT id, name, is_active, plan FROM tenants WHERE slug = $1 OR id::text = $1',
            [tenantIdentifier]
        );

        if (tenantResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                code: 'TENANT_NOT_FOUND',
                message: 'A organização solicitada não existe.'
            });
        }

        const tenant = tenantResult.rows[0];

        if (!tenant.is_active) {
            return res.status(403).json({
                status: 'error',
                code: 'TENANT_SUSPENDED',
                message: 'O acesso a esta organização foi temporariamente suspenso.'
            });
        }

        // Anexar o Tenant resolvido à requisição para uso global no backend
        req.tenantId = tenant.id;
        req.tenantPlan = tenant.plan; // Permite controlo de features baseado no plano da empresa inteira
        
        next();

    } catch (err) {
        logger.error(`Erro crítico ao tentar resolver o tenant: ${tenantIdentifier}`, err);
        res.status(500).json({ status: 'error', code: 'DB_ERROR', message: 'Erro interno ao processar tenant.' });
    }
};
