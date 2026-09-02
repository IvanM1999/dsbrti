/* ============================================================
   orders.js
   DestinyServices OS
   Ordens de Serviço
   ============================================================ */

"use strict";

const Orders = (() => {

    let orders = [];

    async function load() {

        orders = await Storage.getAll("orders");

    }

    function statusBadge(status) {

        switch (status) {

            case "ABERTA":
            case "AGUARDANDO_PECA":

            case "EM_ANDAMENTO":
                return '<span class="badge badge-info">Em andamento</span>';

            case "AGUARDANDO_PEÇA":
                return '<span class="badge badge-warning">Aguardando peça</span>';

            case "FINALIZADA":
                return '<span class="badge badge-success">Finalizada</span>';

            case "ENTREGUE":
                return '<span class="badge badge-success">Entregue</span>';

            default:
                return '<span class="badge">' + status + '</span>';

        }

    }

    async function render() {

        await load();

        Router.render(`

<div class="card">

<div class="card-title">

<span>Ordens de Serviço</span>

<button
id="newOrder"
class="btn btn-primary">

Nova Ordem

</button>

</div>

<table class="data-table">

<thead>

<tr>

<th>OS</th>

<th>Cliente</th>

<th>Equipamento</th>

<th>Status</th>

<th>Entrada</th>

<th>Ações</th>

</tr>

</thead>

<tbody>

${orders.map(order => `

<tr>

<td>${order.number}</td>

<td>${Utils.escape(order.client)}</td>

<td>${Utils.escape(order.equipment)}</td>

<td>${statusBadge(order.status)}</td>

<td>${new Date(order.createdAt).toLocaleDateString("pt-BR")}</td>

<td>

<button
class="btn btn-sm btn-primary edit-order"
data-id="${order.id}">

Editar

</button>

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`);

        document

            .getElementById("newOrder")

            .onclick = newOrder;

        document

            .querySelectorAll(".edit-order")

            .forEach(button => {

                button.onclick = editOrder;

            });

    }

    async function newOrder() {

        const number =

            "OS-" +

            Date.now();

        const order = {

            id: Utils.uuid(),

            number,

            client: "",

            equipment: "",

            serial: "",

            defect: "",

            diagnosis: "",

            solution: "",

            technician: "",

            status: "ABERTA",

            createdAt: Utils.now(),

            updatedAt: Utils.now()

        };

        await Storage.save(

            "orders",

            order

        );

        Utils.toast(

            "Ordem criada.",

            "success"

        );

        render();

        Dashboard.loadKPIs();

    }

    async function editOrder(event) {

        const id =

            event.target.dataset.id;

        const order =

            await Storage.get(

                "orders",

                id

            );

        Router.render(`

<div class="card">

<h2>

Ordem ${order.number}

</h2>

<div class="form-grid">

<div class="form-group">

<label>Cliente</label>

<input
id="osClient"
value="${Utils.escape(order.client)}">

</div>

<div class="form-group">

<label>Equipamento</label>

<input
id="osEquipment"
value="${Utils.escape(order.equipment)}">

</div>

<div class="form-group">

<label>Nº Série</label>

<input
id="osSerial"
value="${Utils.escape(order.serial)}">

</div>

<div class="form-group">

<label>Status</label>

<select id="osStatus">

<option ${order.status==="ABERTA"?"selected":""}>ABERTA</option>

<option ${order.status==="EM_ANDAMENTO"?"selected":""}>EM_ANDAMENTO</option>

<option ${order.status==="AGUARDANDO_PEÇA"?"selected":""}>AGUARDANDO_PEÇA</option>

<option ${order.status==="FINALIZADA"?"selected":""}>FINALIZADA</option>

<option ${order.status==="ENTREGUE"?"selected":""}>ENTREGUE</option>

</select>

</div>

<div class="form-group full">

<label>Defeito</label>

<textarea id="osDefect">${Utils.escape(order.defect)}</textarea>

</div>

<div class="form-group full">

<label>Diagnóstico</label>

<textarea id="osDiagnosis">${Utils.escape(order.diagnosis)}</textarea>

</div>

<div class="form-group full">

<label>Solução</label>

<textarea id="osSolution">${Utils.escape(order.solution)}</textarea>

</div>

</div>

<br>

<button
class="btn btn-success"
id="saveOrder">

Salvar

</button>

</div>

`);

        document

            .getElementById("saveOrder")

            .onclick = async () => {

                order.client =
                    document.getElementById("osClient").value;

                order.equipment =
                    document.getElementById("osEquipment").value;

                order.serial =
                    document.getElementById("osSerial").value;

                order.status =
                    document.getElementById("osStatus").value;

                order.defect =
                    document.getElementById("osDefect").value;

                order.diagnosis =
                    document.getElementById("osDiagnosis").value;

                order.solution =
                    document.getElementById("osSolution").value;

                order.updatedAt =
                    Utils.now();

                await Storage.save(

                    "orders",

                    order

                );

                Utils.toast(

                    "OS atualizada.",

                    "success"

                );

                render();

            };

    }

    Router.register(

        "orders",

        render

    );

    return {

        render

    };

})();
