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
            const stats = await window.api.get('/api/dashboard');

            container.innerHTML = `
                <h2>Visão Geral</h2>
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
