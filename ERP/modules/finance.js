/* ============================================================
   finance.js
   DestinyServices OS
   Financeiro
   ============================================================ */

"use strict";

const Finance = (() => {

    let budgets = [];
    let payments = [];

    async function load() {

        budgets = await Storage.getAll("budgets");

        payments = await Storage.getAll("payments");

    }

    function totalBudgets() {

        return budgets.reduce(

            (sum, budget) =>

                sum + Number(budget.total || 0),

            0

        );

    }

    function totalReceived() {

        return payments.reduce(

            (sum, payment) =>

                payment.status === "PAGO"

                    ? sum + Number(payment.amount || 0)

                    : sum,

            0

        );

    }

    function totalPending() {

        return totalBudgets() - totalReceived();

    }

    async function render() {

        await load();

        Router.render(`

<div class="kpi-grid">

<div class="kpi-card">

<div class="kpi-title">

Total Orçado

</div>

<div class="kpi-value">

${Utils.currencyFormat(totalBudgets())}

</div>

</div>

<div class="kpi-card">

<div class="kpi-title">

Recebido

</div>

<div class="kpi-value">

${Utils.currencyFormat(totalReceived())}

</div>

</div>

<div class="kpi-card">

<div class="kpi-title">

Pendente

</div>

<div class="kpi-value">

${Utils.currencyFormat(totalPending())}

</div>

</div>

</div>

<div class="card">

<div class="card-title">

Financeiro

</div>

<table class="data-table">

<thead>

<tr>

<th>Orçamento</th>

<th>Cliente</th>

<th>Total</th>

<th>Status</th>

<th>Ações</th>

</tr>

</thead>

<tbody>

${budgets.map(budget => `

<tr>

<td>${budget.number}</td>

<td>${Utils.escape(budget.client)}</td>

<td>${Utils.currencyFormat(budget.total)}</td>

<td>

${paymentStatus(budget.id)}

</td>

<td>

<button

class="btn btn-primary btn-sm generate-pix"

data-id="${budget.id}">

PIX

</button>

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`);

        bind();

    }

    function paymentStatus(id) {

        const payment =

            payments.find(

                item =>

                    item.budgetId === id

            );

        if (!payment)

            return '<span class="badge badge-warning">Pendente</span>';

        if (payment.status === "PAGO")

            return '<span class="badge badge-success">Pago</span>';

        return '<span class="badge badge-info">PIX Gerado</span>';

    }

    function bind() {

        document

            .querySelectorAll(".generate-pix")

            .forEach(button => {

                button.onclick = generatePix;

            });

    }

    async function generatePix(event) {

        const budgetId =

            event.target.dataset.id;

        const budget =

            await Storage.get(

                "budgets",

                budgetId

            );

        const result =

            await API.createPix({

                budgetId: budget.id,

                amount: budget.total,

                description:

                    budget.number

            });

        await Storage.save(

            "payments",

            {

                id: Utils.uuid(),

                budgetId: budget.id,

                amount: budget.total,

                status:

                    result.success

                        ? "GERADO"

                        : "PENDENTE",

                payload:

                    result,

                createdAt:

                    Utils.now()

            }

        );

        Utils.toast(

            result.success

                ? "PIX gerado."

                : "Gateway PIX não configurado.",

            result.success

                ? "success"

                : "warning"

        );

        render();

    }

    Router.register(

        "finance",

        render

    );

    return {

        render

    };

})();