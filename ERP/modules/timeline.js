/* ============================================================
   timeline.js
   DestinyServices OS
   Linha do Tempo de Atendimentos
   ============================================================ */

"use strict";

const Timeline = (() => {
   
   async function events() {
      
      const orders =
         
         await Storage.getAll("orders");
      
      const budgets =
         
         await Storage.getAll("budgets");
      
      const payments =
         
         await Storage.getAll("payments");
      
      const history = [];
      
      budgets.forEach(item => {
         
         history.push({
            
            date: item.createdAt,
            
            icon: "💰",
            
            title: "Orçamento criado",
            
            subtitle: item.number,
            
            description: item.client
            
         });
         
      });
      
      orders.forEach(item => {
         
         history.push({
            
            date: item.updatedAt ||
               
               item.createdAt,
            
            icon: "🛠️",
            
            title: "OS atualizada",
            
            subtitle: item.number,
            
            description: item.status
            
         });
         
      });
      
      payments.forEach(item => {
         
         history.push({
            
            date: item.createdAt,
            
            icon: "💳",
            
            title: "Pagamento",
            
            subtitle: item.status,
            
            description:
               
               Utils.currencyFormat(
                  
                  item.amount
                  
               )
            
         });
         
      });
      
      history.sort(
         
         (a, b) =>
         
         new Date(b.date) -
         
         new Date(a.date)
         
      );
      
      return history;
      
   }
   
   async function render() {
      
      const list =
         
         await events();
      
      Router.render(`

<div class="card">

<h2 class="card-title">

Linha do Tempo

</h2>

<div class="timeline">

${list.map(item => `

<div class="timeline-item">

<div class="timeline-icon">

${item.icon}

</div>

<div class="timeline-content">

<h4>

${item.title}

</h4>

<strong>

${Utils.escape(item.subtitle)}

</strong>

<p>

${Utils.escape(item.description)}

</p>

<small>

${new Date(item.date)

.toLocaleString("pt-BR")}

</small>

</div>

</div>

`).join("")}

</div>

</div>

`);
      
   }
   
   Router.register(
      
      "timeline",
      
      render
      
   );
   
   return {
      
      render,
      
      events
      
   };
   
})();