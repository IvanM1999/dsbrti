/* ============================================================
   reports.js
   DestinyServices OS
   Relatórios
   ============================================================ */

"use strict";

const Reports = (() => {

    async function render() {

        const clients =
            await Storage.getAll("clients");

        const budgets =
            await Storage.getAll("budgets");

        const orders =
            await Storage.getAll("orders");

        const payments =
            await Storage.getAll("payments");

        const totalRevenue = budgets.reduce(

            (sum, budget) =>

                sum + Number(budget.total || 0),

            0

        );

        const totalReceived = payments.reduce(

            (sum, payment) =>

                payment.status === "PAGO"

                    ? sum + Number(payment.amount)

                    : sum,

            0

        );

        Router.render(`

<div class="card">

<h2 class="card-title">

Relatórios

</h2>

<div class="kpi-grid">

<div class="kpi-card">

<div class="kpi-title">

Clientes

</div>

<div class="kpi-value">

${clients.length}

</div>

</div>

<div class="kpi-card">

<div class="kpi-title">

Orçamentos

</div>

<div class="kpi-value">

${budgets.length}

</div>

</div>

<div class="kpi-card">

<div class="kpi-title">

Ordens

</div>

<div class="kpi-value">

${orders.length}

</div>

</div>

<div class="kpi-card">

<div class="kpi-title">

Receita

</div>

<div class="kpi-value">

${Utils.currencyFormat(totalRevenue)}

</div>

</div>

</div>

<br>

<div class="action-bar">

<button
class="btn btn-primary"
id="exportClients">

Exportar Clientes

</button>

<button
class="btn btn-primary"
id="exportBudgets">

Exportar Orçamentos

</button>

<button
class="btn btn-primary"
id="exportOrders">

Exportar OS

</button>

<button
class="btn btn-success"
id="backupSystem">

Backup

</button>

</div>

<br>

<table class="data-table">

<thead>

<tr>

<th>Indicador</th>

<th>Valor</th>

</tr>

</thead>

<tbody>

<tr>

<td>Total Recebido</td>

<td>${Utils.currencyFormat(totalReceived)}</td>

</tr>

<tr>

<td>Total Pendente</td>

<td>${Utils.currencyFormat(totalRevenue-totalReceived)}</td>

</tr>

<tr>

<td>Clientes</td>

<td>${clients.length}</td>

</tr>

<tr>

<td>Orçamentos</td>

<td>${budgets.length}</td>

</tr>

<tr>

<td>Ordens</td>

<td>${orders.length}</td>

</tr>

</tbody>

</table>

</div>

`);

        bind();

    }

    async function exportClients() {

        const data =

            await Storage.getAll("clients");

        Utils.download(

            "clientes.json",

            JSON.stringify(data, null, 2)

        );

    }

    async function exportBudgets() {

        const data =

            await Storage.getAll("budgets");

        Utils.download(

            "orcamentos.json",

            JSON.stringify(data, null, 2)

        );

    }

    async function exportOrders() {

        const data =

            await Storage.getAll("orders");

        Utils.download(

            "ordens.json",

            JSON.stringify(data, null, 2)

        );

    }

    async function backup() {

        const backup = {

            exportedAt: Utils.now(),

            clients:

                await Storage.getAll("clients"),

            budgets:

                await Storage.getAll("budgets"),

            orders:

                await Storage.getAll("orders"),

            payments:

                await Storage.getAll("payments"),

            settings:

                Storage.setting("settings")

        };

        Utils.download(

            "backup-destinyservices.json",

            JSON.stringify(backup, null, 2)

        );

        Utils.toast(

            "Backup concluído.",

            "success"

        );

    }

    function bind() {

        document

            .getElementById("exportClients")

            .onclick = exportClients;

        document

            .getElementById("exportBudgets")

            .onclick = exportBudgets;

        document

            .getElementById("exportOrders")

            .onclick = exportOrders;

        document

            .getElementById("backupSystem")

            .onclick = backup;

    }

    Router.register(

        "reports",

        render

    );

    return {

        render

    };

})();