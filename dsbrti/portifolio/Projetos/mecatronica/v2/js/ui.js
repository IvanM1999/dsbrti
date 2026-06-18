// ===== RENDER =====
export const UI = {
  mount(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
};

// ===== COMPONENTES =====

// CARD
export const Card = (title, content) => `
  <div class="card">
    ${title ? `<div class="title">${title}</div>` : ""}
    ${content}
  </div>
`;

// BOTÃO
export const Button = (text, action, type = "primary") => `
  <button class="btn btn-${type}" onclick="${action}">
    ${text}
  </button>
`;

// INPUT
export const Input = (id, placeholder) => `
  <input id="${id}" class="input" placeholder="${placeholder}">
`;

// FEEDBACK
export const Feedback = (msg, type) => `
  <div class="feedback-${type}">
    ${msg}
  </div>
`;

// PROGRESS
export const ProgressBar = (value) => `
  <div class="progress-bar">
    <div class="progress-fill" style="width:${value}%"></div>
  </div>
`;