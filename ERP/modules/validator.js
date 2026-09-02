/* ============================================================
   validator.js
   DestinyServices OS
   Validação de Dados
   ============================================================ */

"use strict";

const Validator = (() => {
   
   function required(value) {
      
      return String(value || "").trim().length > 0;
      
   }
   
   function email(value) {
      
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
         
         .test(value);
      
   }
   
   function phone(value) {
      
      value = Utils.onlyNumbers(value);
      
      return value.length === 10 ||
         
         value.length === 11;
      
   }
   
   function cep(value) {
      
      return Utils.onlyNumbers(value)
         
         .length === 8;
      
   }
   
   function cpfCnpj(value) {
      
      const digits =
         
         Utils.onlyNumbers(value);
      
      return digits.length === 11 ||
         
         digits.length === 14;
      
   }
   
   function money(value) {
      
      return Number(value) >= 0;
      
   }
   
   function quantity(value) {
      
      return Number(value) > 0;
      
   }
   
   function max(value, length) {
      
      return String(value)
         
         .length <= length;
      
   }
   
   function min(value, length) {
      
      return String(value)
         
         .length >= length;
      
   }
   
   function budget(budget) {
      
      const errors = [];
      
      if (!required(budget.client))
         
         errors.push("Cliente obrigatório.");
      
      if (!budget.items ||
         
         budget.items.length === 0)
         
         errors.push("Adicione pelo menos um item.");
      
      if (budget.total <= 0)
         
         errors.push("Total inválido.");
      
      return errors;
      
   }
   
   function client(client) {
      
      const errors = [];
      
      if (!required(client.name))
         
         errors.push("Nome obrigatório.");
      
      if (client.email &&
         
         !email(client.email))
         
         errors.push("E-mail inválido.");
      
      if (client.phone &&
         
         !phone(client.phone))
         
         errors.push("Telefone inválido.");
      
      if (client.document &&
         
         !cpfCnpj(client.document))
         
         errors.push("CPF/CNPJ inválido.");
      
      if (client.zip &&
         
         !cep(client.zip))
         
         errors.push("CEP inválido.");
      
      return errors;
      
   }
   
   return {
      
      required,
      
      email,
      
      phone,
      
      cep,
      
      cpfCnpj,
      
      money,
      
      quantity,
      
      max,
      
      min,
      
      budget,
      
      client
      
   };
   
})();