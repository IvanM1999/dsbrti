import { parseCircuit } from './parser.js';
import { solveNodalWithSteps } from './engine.js';

const state = {
   lastResult: null
};

function showResult(result) {
   
   const output = document.getElementById("output");
   
   if (!result || result.error) {
      output.innerText = "Erro no circuito";
      return;
   }
   
   // FORMATAÇÃO MAIS DIDÁTICA
   let text = "";
   
   for (let node in result.nodes) {
      text += `${node} = ${result.nodes[node].toFixed(2)} V\n`;
   }
   
   output.innerText = text;
}

function showSteps(result) {
   
   if (!result) return;
   
   const div = document.getElementById("steps");
   
   let html = "<div class='title'>Passo a passo</div>";
   
   result.steps.forEach((s, i) => {
      
      html += `
      <div class="step">
        <b>Etapa ${i+1}</b>
        <p>${highlightMath(s)}</p>
      </div>
    `;
   });
   
   div.innerHTML = html;
}

// DESTACA EXPRESSÕES (didático)
function highlightMath(text) {
   return text
      .replace(/V\([^)]+\)/g, '<span class="var">$&</span>')
      .replace(/\d+(\.\d+)?/g, '<span class="num">$&</span>');
}

window.resolver = () => {
   
   const text = document.getElementById("input").value.trim();
   
   if (!text) {
      document.getElementById("output").innerText =
         "Digite um circuito para analisar";
      return;
   }
   
   try {
      
      const parsed = parseCircuit(text);
      const result = solveNodalWithSteps(parsed);
      
      state.lastResult = result;
      
      showResult(result);
      
      // limpa passos ao recalcular
      document.getElementById("steps").style.display = "none";
      
   } catch (e) {
      
      document.getElementById("output").innerText =
         "Erro ao processar circuito";
      
      console.error("Erro detalhado:", e);
   }
};

window.toggleSteps = () => {
   
   const div = document.getElementById("steps");
   
   if (!state.lastResult) {
      div.innerHTML = "Resolva o circuito primeiro";
      return;
   }
   
   const visible = div.style.display === "block";
   
   div.style.display = visible ? "none" : "block";
   
   if (!visible) {
      showSteps(state.lastResult);
   }
};