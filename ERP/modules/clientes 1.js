/* ============================================================
   budget.js
   DestinyServices OS
   Orçamentos
   ============================================================ */

"use strict";

const Budget = (() => {

    let budgets = [];
    let items = [];

    async function load() {

        budgets = await Storage.getAll("budgets");

    }

    function newItem() {

        items.push({

            id: Utils.uuid(),

            description: "",

            quantity: 1,

            unitValue: 0,

            total: 0

        });

        renderItems();

    }

    function renderItems() {

        const tbody =
            document.getElementById("budgetItems");

        if (!tbody) return;

        tbody.innerHTML = "";

        items.forEach((item, index) => {

            const tr = document.createElement("tr");

            tr.innerHTML = `

<td>

<input
class="item-description"
data-index="${index}"
value="${Utils.escape(item.description)}">

</td>

<td>

<input
type="number"
min="1"
class="item-quantity"
data-index="${index}"
value="${item.quantity}">

</td>

<td>

<input
type="number"
step="0.01"
min="0"
class="item-value"
data-index="${index}"
value="${(item.unitValue/100).toFixed(2)}">

</td>

<td class="text-right">

${Utils.currencyFormat(item.total)}

</td>

<td>

<button
class="btn btn-sm btn-danger remove-item"
data-index="${index}">

Excluir

</button>

</td>

`;

            tbody.appendChild(tr);

        });

        bindItems();

        updateTotals();

    }

    function bindItems() {

        document

            .querySelectorAll(".item-description")

            .forEach(input => {

                input.oninput = updateItem;

            });

        document

            .querySelectorAll(".item-quantity")

            .forEach(input => {

                input.oninput = updateItem;

            });

        document

            .querySelectorAll(".item-value")

            .forEach(input => {

                input.oninput = updateItem;

            });

        document

            .querySelectorAll(".remove-item")

            .forEach(button => {

                button.onclick = removeItem;

            });

    }

    function updateItem(event) {

        const index =
            Number(event.target.dataset.index);

        const row =
            items[index];

        row.description =
            document
            .querySelectorAll(".item-description")[index]
            .value;

        row.quantity =
            Number(
                document
                .querySelectorAll(".item-quantity")[index]
                .value
            );

        row.unitValue =
            Utils.currencyToCents(

                document
                .querySelectorAll(".item-value")[index]
                .value

            );

        row.total =
            row.quantity *
            row.unitValue;

        renderItems();

    }

    function removeItem(event) {

        items.splice(

            Number(event.target.dataset.index),

            1

        );

        renderItems();

    }

    function updateTotals() {

        const total =
            items.reduce(

                (sum, item) =>

                    sum + item.total,

                0

            );

        const element =
            document.getElementById("budgetTotal");

        if (element) {

            element.textContent =
                Utils.currencyFormat(total);

        }

    }

    function form() {

        return `

<div class="card">

<div class="card-header">

<h2 class="card-title">

Novo Orçamento

</h2>

</div>

<form id="budgetForm">

<div class="form-grid">

<div class="form-group">

<label class="form-label">

Cliente

</label>

<input
id="budgetClient"
required>

</div>

<div class="form-group">

<label class="form-label">

Equipamento

</label>

<input
id="budgetEquipment">

</div>

<div class="form-group full">

<label class="form-label">

Defeito Relatado

</label>

<textarea
id="budgetProblem"></textarea>

</div>

</div>

<hr>

<div class="action-bar">

<button
type="button"
id="addItem"
class="btn btn-success">

Adicionar Item

</button>

</div>

<div class="table-responsive">

<table class="table">

<thead>

<tr>

<th>Descrição</th>

<th width="100">Qtd</th>

<th width="140">Valor</th>

<th width="140">Total</th>

<th width="90"></th>

</tr>

</thead>

<tbody id="budgetItems">

</tbody>

</table>

</div>

<div class="total-box mt-24">

<div class="total-row total-final">

<span>Total</span>

<strong id="budgetTotal">

R$ 0,00

</strong>

</div>

</div>

<div class="action-bar">

<div class="action-left">

<button
type="submit"
class="btn btn-primary">

Salvar

</button>

<button
type="button"
class="btn btn-outline"
onclick="window.print()">

Imprimir

</button>

</div>

</div>

</form>

</div>

`;

    }

    function list() {

        return `

<div class="card">

<div class="card-header">

<h2 class="card-title">

Orçamentos

</h2>

</div>

<div class="table-responsive">

<table class="table">

<thead>

<tr>

<th>Número</th>

<th>Cliente</th>

<th>Total</th>

<th>Data</th>

</tr>

</thead>

<tbody>

${budgets.map(budget => `

<tr>

<td>${budget.number}</td>

<td>${Utils.escape(budget.client)}</td>

<td>${Utils.currencyFormat(budget.total)}</td>

<td>${new Date(budget.createdAt).toLocaleDateString("pt-BR")}</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

</div>

`;

    }

    async function save(event) {

        event.preventDefault();

        const total =
            items.reduce(

                (sum, item) =>

                    sum + item.total,

                0

            );

        await Storage.save(

            "budgets",

            {

                id: Utils.uuid(),

                number: "OR-" + Date.now(),

                client:
                    document.getElementById("budgetClient").value,

                equipment:
                    document.getElementById("budgetEquipment").value,

                problem:
                    document.getElementById("budgetProblem").value,

                items,

                total,

                status: "ABERTO",

                createdAt: Utils.now()

            }

        );

        Utils.toast(

            "Orçamento salvo.",

            "success"

        );

        items = [];

        render();

        Dashboard.loadKPIs();

    }

    async function render() {

        await load();

        Router.render(

            form() +

            list()

        );

        document

            .getElementById("addItem")

            .onclick = newItem;

        document

            .getElementById("budgetForm")

            .onsubmit = save;

        renderItems();

    }

    Router.register(

        "budgets",

        render

    );

    return {

        render

    };

})();