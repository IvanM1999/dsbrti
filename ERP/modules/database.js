/* ============================================================
   database.js
   DestinyServices OS
   Estrutura de Dados
   ============================================================ */

"use strict";

const Database = Object.freeze({
   
   version: 1,
   
   stores: {
      
      users: {
         
         keyPath: "id"
         
      },
      
      clients: {
         
         keyPath: "id"
         
      },
      
      budgets: {
         
         keyPath: "id"
         
      },
      
      orders: {
         
         keyPath: "id"
         
      },
      
      payments: {
         
         keyPath: "id"
         
      },
      
      logs: {
         
         keyPath: "id"
         
      },
      
      settings: {
         
         keyPath: "id"
         
      }
      
   },
   
   budgetStatus: [
      
      "RASCUNHO",
      
      "ENVIADO",
      
      "APROVADO",
      
      "REPROVADO",
      
      "CANCELADO"
      
   ],
   
   orderStatus: [
      
      "ABERTA",
      
      "EM_ANALISE",
      
      "AGUARDANDO_APROVACAO",
      
      "AGUARDANDO_PECA",
      
      "EM_EXECUCAO",
      
      "PRONTO",
      
      "ENTREGUE",
      
      "CANCELADA"
      
   ],
   
   paymentStatus: [
      
      "PENDENTE",
      
      "PIX_GERADO",
      
      "PAGO",
      
      "CANCELADO",
      
      "ESTORNADO"
      
   ],
   
   paymentMethods: [
      
      "PIX",
      
      "DINHEIRO",
      
      "CARTAO",
      
      "TRANSFERENCIA",
      
      "BOLETO"
      
   ],
   
   equipmentTypes: [
      
      "Notebook",
      
      "Desktop",
      
      "Monitor",
      
      "Fonte",
      
      "Nobreak",
      
      "Impressora",
      
      "Televisão",
      
      "Micro-ondas",
      
      "Máquina de Lavar",
      
      "Placa Eletrônica",
      
      "Inversor",
      
      "Motor",
      
      "Quadro Elétrico",
      
      "Outro"
      
   ],
   
   logTypes: [
      
      "LOGIN",
      
      "LOGOUT",
      
      "CREATE",
      
      "UPDATE",
      
      "DELETE",
      
      "IMPORT",
      
      "EXPORT",
      
      "BACKUP",
      
      "RESTORE"
      
   ]
   
});