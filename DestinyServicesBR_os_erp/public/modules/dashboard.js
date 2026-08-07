/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/modules/dashboard.js
   Dashboard / Visão Geral
   ============================================================ */

"use strict";

import { Utils } from '../utils.js';

export const Dashboard = {
    async render(container) {
        container.innerHTML = '<h2>Dashboard</h2><p>Carregando dados...</p>';

        try {
            const [stats, config] = await Promise.all([
                window.api.get('/api/dashboard'),
                window.api.get('/api/config').catch(() => ({ empresa: {} }))
            ]);

            const empresa = config.empresa || {};
            const nomeEmpresa = empresa.nomeEmpresa || localStorage.getItem('cfg_empresa_nome') || 'Ivan Montibeller';
            const cnpj = empresa.cnpj || localStorage.getItem('cfg_empresa_cnpj') || '45.609.430/0001-43';

            container.innerHTML = `
                <h2>Visão Geral</h2>
                <div class="card" style="margin-bottom: 16px;">
                    <h3>Empresa</h3>
                    <p><strong>${Utils.escape(nomeEmpresa)}</strong></p>
                    <p>${Utils.escape(empresa.razaoSocial || 'Destiny Services TI & Destiny ServicesBR')}</p>
                    <p><strong>CNPJ:</strong> ${Utils.escape(cnpj)}</p>
                </div>
                <div class="grid">
                    <div class="stat-box">
                        <h4>Total de Clientes</h4>
                        <p>${stats.clientes || 0}</p>
                    </div>
                    <div class="stat-box">
                        <h4>Ordens de Serviço</h4>
                        <p>${stats.os || 0}</p>
                    </div>
                    <div class="stat-box" style="background: #27ae60; color: #fff;">
                        <h4>Receitas Totais</h4>
                        <p>${Utils.formatCurrency(stats.receitas || 0)}</p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[Dashboard Error]:', error);
            container.innerHTML = '<h2>Dashboard</h2><p>Erro ao carregar dados do painel.</p>';
        }
    }
};
