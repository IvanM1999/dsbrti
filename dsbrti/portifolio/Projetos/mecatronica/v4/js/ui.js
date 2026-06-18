// =============================
// UI CORE (Render Engine)
// =============================
export const UI = {
  
  mount(id, html) {
    const el = document.getElementById(id);
    
    if (!el) {
      console.warn(`UI.mount: #${id} não encontrado`);
      return;
    }
    
    const safeHTML = typeof html === "string" ? html : ""; // CORREÇÃO
    
    if (el.innerHTML !== safeHTML) {
      el.innerHTML = safeHTML;
    }
  },
  
  append(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (typeof html !== "string") return; // CORREÇÃO
    
    const temp = document.createElement("div");
    temp.innerHTML = html;
    
    while (temp.firstChild) {
      el.appendChild(temp.firstChild);
    }
  },
  
  clear(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  }
  
};

// =============================
// ACTION REGISTRY (SEGURANÇA)
// =============================
const Actions = {};

export function registerAction(name, fn) {
  if (!name || typeof fn !== "function") return; // CORREÇÃO
  Actions[name] = fn;
}

// =============================
// EVENT DELEGATION (ROBUSTO)
// =============================
document.addEventListener("click", (e) => {
  
  const btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null; // CORREÇÃO
  if (!btn) return;
  
  const action = btn.dataset.action;
  
  if (!action || !Actions[action]) {
    console.warn(`Ação não registrada: ${action}`);
    return;
  }
  
  // evita spam de clique
  if (btn.dataset.loading === "true") return;
  
  btn.dataset.loading = "true";
  
  try {
    Actions[action](e);
  } catch (err) {
    console.error("Erro na ação:", err); // CORREÇÃO
  } finally {
    setTimeout(() => {
      btn.dataset.loading = "false";
    }, 300);
  }
  
});

// =============================
// UTILIDADES
// =============================
function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// =============================
// COMPONENTES BASE
// =============================

// CARD
export const Card = ({ title, content, className = "" } = {}) => ` 
  <div class="card ${className || ""}">
    ${title ? `<div class="title">${escapeHTML(title)}</div>` : ""}
    ${typeof content === "string" ? content : ""} 
  </div>
`;

// BOTÃO
export const Button = ({
  text,
  action,
  type = "primary",
  full = false,
  disabled = false
} = {}) => `
  <button 
    class="btn btn-${type} ${full ? "w-100" : ""}" 
    data-action="${action || ""}"
    ${disabled ? "disabled" : ""}
  >
    ${escapeHTML(text)}
  </button>
`;

// INPUT
export const Input = ({
  id,
  placeholder = "",
  type = "text"
} = {}) => `
  <input 
    id="${id || ""}" 
    type="${type}"
    class="input" 
    placeholder="${escapeHTML(placeholder)}"
    autocomplete="off"
  >
`;

// FEEDBACK (controlado)
export const Feedback = ({ message, type } = {}) => `
  <div class="feedback-${type || ""}">
    ${typeof message === "string" ? message : ""} 
  </div>
`;

// =============================
// COMPONENTES VISUAIS
// =============================

// PROGRESS BAR
export const ProgressBar = ({ value = 0 } = {}) => {
  
  const safe = Math.max(0, Math.min(100, Number(value) || 0)); // CORREÇÃO
  
  return `
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width:${safe}%"
      ></div>
    </div>
  `;
};

// STATS CARD
export const StatsCard = ({ title, value } = {}) => `
  <div class="card">
    <div class="title">${escapeHTML(title)}</div>
    <h2>${escapeHTML(value)}</h2>
  </div>
`;

// BADGE
export const Badge = ({ text, type } = {}) => `
  <span class="badge badge-${type || ""}">
    ${escapeHTML(text)}
  </span>
`;

// =============================
// COMPONENTES COMPLEXOS
// =============================

// CARD DE EXERCÍCIO
export const ExerciseCard = ({ question } = {}) => `
  <div class="card" id="exerciseCard">
    
    <div class="title">Exercício</div>

    <p>${escapeHTML(question)}</p>

    ${Input({
      id: "answer",
      placeholder: "Digite sua resposta"
    })}

    <div class="actions">
      ${Button({ text: "Verificar", action: "check" })}
      ${Button({ text: "Novo", action: "newExercise", type: "secondary" })}
    </div>

    <div id="feedback"></div>

  </div>
`;

// DASHBOARD
export const DashboardStats = ({ acc, total, correct } = {}) => `
  ${StatsCard({ title: "Aproveitamento", value: (Number.isFinite(acc) ? acc : 0).toFixed(1) + "%" })} 
  ${StatsCard({ title: "Total", value: Number.isFinite(total) ? total : 0 })} 
  ${StatsCard({ title: "Acertos", value: Number.isFinite(correct) ? correct : 0 })} 
`;

// =============================
// STEPS (AGORA SEGURO)
// =============================
export const Steps = (steps = []) => {
  
  if (!Array.isArray(steps) || !steps.length) return ""; // CORREÇÃO
  
  return `
    <div class="steps">
      <div class="title">Resolução</div>
      ${steps.map(s => `<div class="step">${escapeHTML(s)}</div>`).join("")}
    </div>
  `;
};