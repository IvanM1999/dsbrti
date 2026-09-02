/* ============================================================
   history.js
   DestinyServices OS
   Histórico de Equipamentos
   ============================================================ */

"use strict";

const History = (() => {
   
   async function byClient(clientId) {
      
      const orders =
         
         await Storage.getAll("orders");
      
      return orders.filter(
         
         order =>
         
         order.clientId === clientId
         
      );
      
   }
   
   async function byEquipment(serial) {
      
      const orders =
         
         await Storage.getAll("orders");
      
      return orders.filter(
         
         order =>
         
         order.serial === serial
         
      );
      
   }
   
   async function renderClient(clientId) {
      
      const history =
         
         await byClient(clientId);
      
      return `

<div class="card">

<h3>

Histórico do Cliente

</h3>

<table class="data-table">

<thead>

<tr>

<th>OS</th>

<th>Equipamento</th>

<th>Status</th>

<th>Data</th>

</tr>

</thead>

<tbody>

${history.map(order => `

<tr>

<td>${order.number}</td>

<td>${Utils.escape(order.equipment)}</td>

<td>${order.status}</td>

<td>

${new Date(order.createdAt)

.toLocaleDateString("pt-BR")}

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`;
      
   }
   
   async function renderEquipment(serial) {
      
      const history =
         
         await byEquipment(serial);
      
      return `

<div class="card">

<h3>

Histórico do Equipamento

</h3>

<table class="data-table">

<thead>

<tr>

<th>OS</th>

<th>Cliente</th>

<th>Status</th>

<th>Entrada</th>

</tr>

</thead>

<tbody>

${history.map(order => `

<tr>

<td>${order.number}</td>

<td>${Utils.escape(order.client)}</td>

<td>${order.status}</td>

<td>

${new Date(order.createdAt)

.toLocaleDateString("pt-BR")}

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`;
      
   }
   
   return {
      
      byClient,
      
      byEquipment,
      
      renderClient,
      
      renderEquipment
      
   };
   
})();