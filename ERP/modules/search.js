/* ============================================================
   search.js
   DestinyServices OS
   Pesquisa Global
   ============================================================ */

"use strict";

const Search = (() => {
   
   async function index() {
      
      const data = [];
      
      const collections = [
         
         "clients",
         
         "budgets",
         
         "orders",
         
         "payments"
         
      ];
      
      for (const collection of collections) {
         
         const items =
            
            await Storage.getAll(collection);
         
         items.forEach(item => {
            
            data.push({
               
               collection,
               
               item
               
            });
            
         });
         
      }
      
      return data;
      
   }
   
   async function find(query) {
      
      query =
         
         query
         
         .trim()
         
         .toLowerCase();
      
      if (!query) return [];
      
      const database =
         
         await index();
      
      return database.filter(record =>
         
         JSON.stringify(record.item)
         
         .toLowerCase()
         
         .includes(query)
         
      );
      
   }
   
   async function render(query) {
      
      const result =
         
         await find(query);
      
      const tbody =
         
         document.getElementById(
            
            "searchResults"
            
         );
      
      if (!tbody) return;
      
      tbody.innerHTML = result.map(row => `

<tr>

<td>

${row.collection}

</td>

<td>

${row.item.number || row.item.name || "-"}

</td>

<td>

${row.item.client || "-"}

</td>

<td>

<button

class="btn btn-primary btn-sm"

data-type="${row.collection}"

data-id="${row.item.id}">

Abrir

</button>

</td>

</tr>

`).join("");
      
   }
   
   function bind(inputId) {
      
      const input =
         
         document.getElementById(inputId);
      
      if (!input) return;
      
      input.addEventListener(
         
         "input",
         
         Utils.debounce(
            
            event =>
            
            render(
               
               event.target.value
               
            ),
            
            250
            
         )
         
      );
      
   }
   
   return {
      
      bind,
      
      find,
      
      render
      
   };
   
})();