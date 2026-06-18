import { Progress } from './progress.js';
import { UI } from './ui.js';

export function renderDashboard() {
  
  const rawAcc = (typeof Progress.accuracy === "function") ? Progress.accuracy() : 0; // CORREÇÃO: validação de função
  const acc = (typeof rawAcc === "number") ? rawAcc : parseFloat(rawAcc);
  const safeAcc = Number.isFinite(acc) ? acc : 0; // CORREÇÃO
  
  // =============================
  // Define nível e medalha
  // =============================
  let level = "";
  let medal = "";
  
  if (safeAcc < 40) {
    level = "Iniciante";
    medal = "assets/medal_bronze.png";
  } else if (safeAcc < 70) {
    level = "Intermediário";
    medal = "assets/medal_prata.png";
  } else {
    level = "Avançado";
    medal = "assets/medal_ouro.png";
  }
  
  // =============================
  // Atualiza DOM
  // =============================
  const levelEl = document.getElementById("level");
  const medalEl = document.getElementById("medal");
  
  if (levelEl) levelEl.innerText = level;
  if (medalEl) medalEl.src = medal;
  
  const p = (typeof Progress.load === "function") ? Progress.load() : { total: 0, correct: 0 }; // CORREÇÃO
  const percent = Number.isFinite(safeAcc) ? safeAcc : 0; // CORREÇÃO
  
  // anima barra
  const fill = document.querySelector("#progressBar .progress-fill");
  if (fill) {
    fill.style.width = percent + "%";
  }
  
  // render de cards detalhados
  UI.mount("statsContainer", `
    <div class="card">
      <div class="title">Aproveitamento</div>
      <h2>${percent}%</h2>
    </div>

    <div class="card">
      <div class="title">Total de Exercícios</div>
      <h2>${(p && typeof p.total === "number") ? p.total : 0}</h2> <!-- CORREÇÃO -->
    </div>

    <div class="card">
      <div class="title">Acertos</div>
      <h2>${(p && typeof p.correct === "number") ? p.correct : 0}</h2> <!-- CORREÇÃO -->
    </div>
  `);
}

// Chamada imediata ao carregar dashboard
renderDashboard();