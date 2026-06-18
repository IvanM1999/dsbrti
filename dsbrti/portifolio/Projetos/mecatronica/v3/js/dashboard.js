import { Progress } from './progress.js';
import { UI, ProgressBar } from './ui.js';

export function renderDashboard() {
  
  const acc = parseFloat(Progress.accuracy());
  
  // =============================
  // Define nível e medalha
  // =============================
  let level = "";
  let medal = "";
  
  if (acc < 40) {
    level = "Iniciante";
    medal = "assets/medal_bronze.png";
  } else if (acc < 70) {
    level = "Intermediário";
    medal = "assets/medal_prata.png";
  } else {
    level = "Avançado";
    medal = "assets/medal_ouro.png";
  }
  
  // =============================
  // Atualiza DOM
  // =============================
  document.getElementById("level").innerText = level;
  document.getElementById("medal").src = medal;
  
  const p = Progress.load();
  const percent = Progress.accuracy();
  
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
      <h2>${p.total}</h2>
    </div>

    <div class="card">
      <div class="title">Acertos</div>
      <h2>${p.correct}</h2>
    </div>
  `);
}

// Chamada imediata ao carregar dashboard
renderDashboard();

StatsCard({ title: "Streak", value: stats.streak })
StatsCard({ title: "Recorde", value: stats.bestStreak })