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
// Evita repetir document.getElementById
// =============================
function $(id) {
   return document.getElementById(id);
}

// =============================
// RENDER: RESULTADO
// =============================
function showResult(result) {
   
   const output = $("output");
   
   // Validação básica
   if (!result || result.error) {
      output.innerText = "Erro no circuito";
      return;
   }
   
   // Formatação mais didática (tensão por nó)
   let text = "";
   
   for (let node in result.nodes) {
      const value = result.nodes[node];
      
      text += `${node} = ${value.toFixed(2)} V\n`;
   }
   
   output.innerText = text;
}

// =============================
// RENDER: PASSO A PASSO
// =============================
function showSteps(result) {
   
   if (!result) return;
   
   const div = $("steps");
   
   let html = "<div class='title'>Passo a passo</div>";
   
   result.steps.forEach((step, index) => {
      
      html += `
      <div class="step">
        <b>Etapa ${index + 1}</b>
        <p>${highlightMath(step)}</p>
      </div>
    `;
   });
   
   div.innerHTML = html;
}

// =============================
// UTIL: DESTAQUE MATEMÁTICO
// - variáveis (V(n1))
// - números
// =============================
function highlightMath(text) {
   return text
      .replace(/V\([^)]+\)/g, '<span class="var">$&</span>')
      .replace(/\d+(\.\d+)?/g, '<span class="num">$&</span>');
}

// =============================
// AÇÃO: RESOLVER CIRCUITO
// =============================
window.resolver = () => {
   
   const input = $("input").value.trim();
   
   // Validação de entrada
   if (!input) {
      $("output").innerText = "Digite um circuito para analisar";
      return;
   }
   
   try {
      
      // Pipeline de processamento
      const parsed = parseCircuit(input);
      const result = solveNodalWithSteps(parsed);
      
      // Atualiza estado
      state.lastResult = result;
      
      // Renderiza resultado
      showResult(result);
      
      // Reseta visual dos passos
      $("steps").style.display = "none";
      $("steps").innerHTML = "";
      
   } catch (error) {
      
      $("output").innerText = "Erro ao processar circuito";
      
      // Log técnico (debug)
      console.error("Erro detalhado:", error);
   }
};

// =============================
// AÇÃO: TOGGLE PASSO A PASSO
// =============================
window.toggleSteps = () => {
   
   const div = $("steps");
   
   // Sem resultado ainda
   if (!state.lastResult) {
      div.innerHTML = "Resolva o circuito primeiro";
      return;
   }
   
   const isVisible = div.style.display === "block";
   
   // Alterna visibilidade
   div.style.display = isVisible ? "none" : "block";
   
   // Renderiza apenas quando abrir
   if (!isVisible) {
      showSteps(state.lastResult);
   }
};