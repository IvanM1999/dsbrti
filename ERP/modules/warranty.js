/* ============================================================
   warranty.js
   DestinyServices OS
   Garantias
   ============================================================ */

"use strict";

const Warranty = (() => {
   
   function addDays(dateStr, days) {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + Number(days));
      return d.toISOString();
   }

   async function create(order) {
      
      const settings = Storage.setting("settings") || {
         budget: {
            laborWarranty: 90,
            productWarranty: 90
         }
      };
      
      const laborDays = settings.budget?.laborWarranty || 90;
      
      const partsDays = settings.budget?.productWarranty || 90;
      
      const issuedAt = Utils.now();
      
      const warranty = {
         
         id: Utils.uuid(),
         
         orderId: order.id,
         
         client: order.client,
         
         equipment: order.equipment,
         
         laborWarranty: laborDays,
         
         partsWarranty: partsDays,
         
         issuedAt,
         
         laborExpires: addDays(issuedAt, laborDays),
         
         partsExpires: addDays(issuedAt, partsDays)
         
      };
      
      await Storage.save(
         
         "warranties",
         
         warranty
         
      );
      
      return warranty;
      
   }
   
   async function byOrder(orderId) {
      
      const list =
         
         await Storage.getAll(
            
            "warranties"
            
         );
      
      return list.find(
         
         item =>
         
         item.orderId === orderId
         
      );
      
   }
   
   function expired(date) {
      
      return new Date(date) < new Date();
      
   }
   
   function html(warranty) {
      
      return `

<div class="document">

<div class="header-card">

<h2>

CERTIFICADO DE GARANTIA

</h2>

</div>

<div class="info-grid">

<div class="info-box">

<p>

<strong>Cliente:</strong>

${Utils.escape(

warranty.client

)}

</p>

<p>

<strong>Equipamento:</strong>

${Utils.escape(

warranty.equipment

)}

</p>

</div>

<div class="info-box">

<p>

<strong>Mão de Obra:</strong>

${warranty.laborWarranty} dias

</p>

<p>

<strong>Peças:</strong>

${warranty.partsWarranty} dias

</p>

</div>

</div>

<div class="notes-box">

A garantia cobre apenas os serviços executados e as peças substituídas no orçamento correspondente.

</div>

</div>

`;
      
   }
   
   return {
      
      create,
      
      byOrder,
      
      expired,
      
      html
      
   };
   
})();
