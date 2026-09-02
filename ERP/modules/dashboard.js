/* ============================================================
   dashboard.js
   DestinyServices OS
   Dashboard (Completo, Auditado e Otimizado)
   ============================================================ */

"use strict";

const Dashboard = (() => {

    async function loadKPIs() {
        const clients = (await Storage.getAll("clients")) || [];
        const budgets = (await Storage.getAll("budgets")) || [];
        const orders = (await Storage.getAll("orders")) || [];

        const revenue = budgets.reduce((total, budget) => total + Number(budget.total || 0), 0);

        const kpiClientsEl = document.getElementById("kpiClients");
        if (kpiClientsEl) kpiClientsEl.textContent = clients.length;

        const kpiBudgetsEl = document.getElementById("kpiBudgets");
        if (kpiBudgetsEl) kpiBudgetsEl.textContent = budgets.length;

        const kpiOrdersEl = document.getElementById("kpiOrders");
        if (kpiOrdersEl) kpiOrdersEl.textContent = orders.length;

        const kpiRevenueEl = document.getElementById("kpiRevenue");
        if (kpiRevenueEl) kpiRevenueEl.textContent = Utils.currencyFormat(revenue);
    }

    async function recentBudgets() {
        const budgets = (await Storage.getAll("budgets")) || [];
        budgets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return budgets.slice(0, 5);
    }

    async function recentClients() {
        const clients = (await Storage.getAll("clients")) || [];
        clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return clients.slice(0, 5);
    }

    async function render() {
        const budgets = await recentBudgets();
        const clients = await recentClients();

        const budgetsHtml = budgets.length ? budgets.map(budget => `
            <div class="activity-item">
                <div class="activity-icon">📄</div>
                <div class="activity-content">
                    <div class="activity-title">${Utils.escape(budget.number)}</div>
                    <div class="activity-time">${Utils.escape(budget.client)}</div>
                </div>
            </div>
        `).join("") : `<div class="empty-state"><p>Nenhum orçamento cadastrado.</p></div>`;

        const clientsHtml = clients.length ? clients.map(client => `
            <div class="activity-item">
                <div class="activity-icon">👤</div>
                <div class="activity-content">
                    <div class="activity-title">${Utils.escape(client.name)}</div>
                    <div class="activity-time">${Utils.escape(client.phone || "")}</div>
                </div>
            </div>
        `).join("") : `<div class="empty-state"><p>Nenhum cliente cadastrado.</p></div>`;

        Router.render(`
            <div class="dashboard">
                <div class="dashboard-grid">
                    <div class="widget">
                        <div class="widget-header">
                            <h3 class="widget-title">Últimos Orçamentos</h3>
                        </div>
                        <div class="activity-list">
                            ${budgetsHtml}
                        </div>
                    </div>
                    <div class="widget">
                        <div class="widget-header">
                            <h3 class="widget-title">Clientes Recentes</h3>
                        </div>
                        <div class="activity-list">
                            ${clientsHtml}
                        </div>
                    </div>
                </div>
                <div class="widget">
                    <div class="widget-header">
                        <h3 class="widget-title">Atalhos</h3>
                    </div>
                    <div class="action-bar">
                        <button id="dashboardNewBudget" class="btn btn-primary">Novo Orçamento</button>
                        <button id="dashboardNewClient" class="btn btn-success">Novo Cliente</button>
                        <button id="dashboardFinance" class="btn btn-secondary">Financeiro</button>
                    </div>
                </div>
            </div>
        `);

        await loadKPIs();
        bind();
    }

    function bind() {
        const budgetBtn = document.getElementById("dashboardNewBudget");
        if (budgetBtn) {
            budgetBtn.onclick = () => Router.navigate("budgets");
        }

        const clientBtn = document.getElementById("dashboardNewClient");
        if (clientBtn) {
            clientBtn.onclick = () => Router.navigate("clients");
        }

        const financeBtn = document.getElementById("dashboardFinance");
        if (financeBtn) {
            financeBtn.onclick = () => Router.navigate("finance");
        }
    }

    Router.register("dashboard", render);

    return {
        render,
        loadKPIs
    };

})();
