// =============================
// ANALISE DE CIRCUITO - CONTROLADOR
// =============================

import { parseCircuit } from './parser.js';
import { solveNodalWithSteps } from './engine.js';

// =============================
// ESTADO LOCAL
// =============================
const state = {
   lastResult: null
};

// =============================
// UTIL: GET ELEMENTO
// =============================
function $(id) {
   return document.getElementById(id);
}

// =============================
// UTIL: ESCAPE HTML
// =============================
function escapeHTML(str) {
   return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}

// =============================
// RENDER: RESULTADO
// =============================
function showResult(result) {
   
   const output = $("output");
   if (!output) return; // CORREÇÃO: validação de elemento
   
   if (!result || result.error || !result.nodes || typeof result.nodes !== "object") {
      output.innerText = "Erro no circuito";
      return;
   }
   
   let text = "";
   
   for (const node in result.nodes) {
      if (!Object.prototype.hasOwnProperty.call(result.nodes, node)) continue;
      
      const value = result.nodes[node];
      const num = (typeof value === "number" && Number.isFinite(value)) ? value : 0; // CORREÇÃO: uso de Number.isFinite
      
      text += `${node} = ${num.toFixed(2)} V\n`;
   }
   
   output.innerText = text;
}

// =============================
// RENDER: PASSO A PASSO
// =============================
function showSteps(result) {
   
   if (!result || !Array.isArray(result.steps)) return;
   
   const div = $("steps");
   if (!div) return; // CORREÇÃO: validação de elemento
   
   let html = "<div class='title'>Passo a passo</div>";
   
   result.steps.forEach((step, index) => {
      const safeStep = highlightMath(escapeHTML(step));
      
      html += `
      <div class="step">
        <b>Etapa ${index + 1}</b>
        <p>${safeStep}</p>
      </div>
    `;
   });
   
   div.innerHTML = html;
}

// =============================
// UTIL: DESTAQUE MATEMÁTICO
// =============================
function highlightMath(text) {
   return String(text) // CORREÇÃO: garante string
      .replace(/V\([^)]+\)/g, '<span class="var">$&</span>')
      .replace(/\d+(\.\d+)?/g, '<span class="num">$&</span>');
}

// =============================
// AÇÃO: RESOLVER CIRCUITO
// =============================
window.resolver = () => {
   
   const inputEl = $("input");
   const stepsEl = $("steps");
   const outputEl = $("output");
   
   if (!inputEl || !stepsEl || !outputEl) return; // CORREÇÃO: validação de elementos
   
   const input = (inputEl.value || "").trim(); // CORREÇÃO: proteção contra undefined
   
   if (!input) {
      outputEl.innerText = "Digite um circuito para analisar";
      return;
   }
   
   try {
      
      const parsed = parseCircuit(input);
      const result = solveNodalWithSteps(parsed);
      
      state.lastResult = result;
      
      showResult(result);
      
      stepsEl.style.display = "none";
      stepsEl.innerHTML = "";
      
   } catch (error) {
      
      outputEl.innerText = "Erro ao processar circuito";
      console.error("Erro detalhado:", error);
   }
};

// =============================
// AÇÃO: TOGGLE PASSO A PASSO
// =============================
window.toggleSteps = () => {
   
   const div = $("steps");
   if (!div) return; // CORREÇÃO: validação de elemento
   
   if (!state.lastResult) {
      div.innerText = "Resolva o circuito primeiro";
      return;
   }
   
   const isVisible = div.style.display === "block";
   
   div.style.display = isVisible ? "none" : "block";
   
   if (isVisible) {
      div.innerHTML = "";
      return;
   }
   
   showSteps(state.lastResult);
};