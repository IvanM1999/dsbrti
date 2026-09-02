/* ============================================================
   sync.js
   DestinyServices OS
   Sincronização e Backup
   ============================================================ */

"use strict";

const Sync = (() => {
   
   async function exportDatabase() {
      
      const backup = {
         
         version: "1.0.0",
         
         exportedAt: Utils.now(),
         
         data: {
            
            clients: await Storage.getAll("clients"),
            
            budgets: await Storage.getAll("budgets"),
            
            orders: await Storage.getAll("orders"),
            
            payments: await Storage.getAll("payments")
            
         },
         
         settings: Storage.setting("settings")
         
      };
      
      Utils.download(
         
         "DestinyServices_Backup.json",
         
         JSON.stringify(backup, null, 2)
         
      );
      
      Utils.toast(
         
         "Backup exportado.",
         
         "success"
         
      );
      
   }
   
   async function importDatabase(file) {
      
      const text = await file.text();
      
      const backup = JSON.parse(text);
      
      if (!backup.data) {
         
         throw new Error(
            
            "Backup inválido."
            
         );
         
      }
      
      await Storage.clear("clients");
      
      await Storage.clear("budgets");
      
      await Storage.clear("orders");
      
      await Storage.clear("payments");
      
      for (const item of backup.data.clients) {
         
         await Storage.save(
            
            "clients",
            
            item
            
         );
         
      }
      
      for (const item of backup.data.budgets) {
         
         await Storage.save(
            
            "budgets",
            
            item
            
         );
         
      }
      
      for (const item of backup.data.orders) {
         
         await Storage.save(
            
            "orders",
            
            item
            
         );
         
      }
      
      for (const item of backup.data.payments) {
         
         await Storage.save(
            
            "payments",
            
            item
            
         );
         
      }
      
      if (backup.settings) {
         
         Storage.setting(
            
            "settings",
            
            backup.settings
            
         );
         
      }
      
      Utils.toast(
         
         "Backup restaurado.",
         
         "success"
         
      );
      
      Router.navigate(
         
         "dashboard"
         
      );
      
   }
   
   async function wipe() {
      
      if (
         
         !confirm(
            
            "Apagar todos os dados?"
            
         )
         
      ) {
         
         return;
         
      }
      
      await Storage.clear("clients");
      
      await Storage.clear("budgets");
      
      await Storage.clear("orders");
      
      await Storage.clear("payments");
      
      Utils.toast(
         
         "Banco limpo.",
         
         "warning"
         
      );
      
      Router.navigate(
         
         "dashboard"
         
      );
      
   }
   
   function statistics() {
      
      return Promise.all([
         
         Storage.getAll("clients"),
         
         Storage.getAll("budgets"),
         
         Storage.getAll("orders"),
         
         Storage.getAll("payments")
         
      ]).then(result => ({
         
         clients:
            
            result[0].length,
         
         budgets:
            
            result[1].length,
         
         orders:
            
            result[2].length,
         
         payments:
            
            result[3].length
         
      }));
      
   }
   
   return {
      
      exportDatabase,
      
      importDatabase,
      
      wipe,
      
      statistics
      
   };
   
})();