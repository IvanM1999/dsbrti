// =============================
// APP PRINCIPAL (REFATORADO)
// =============================

import { UI, Feedback, ExerciseCard, DashboardStats } from './ui.js';
import { EngineMath } from './enginemath.js';
import { Progress } from './progress.js';
import { getAdaptiveExercise } from './exercises.js';

// -----------------------------
// UTIL
// -----------------------------
function $(id) {
   return document.getElementById(id);
}

// -----------------------------
// APP
// -----------------------------
const App = {
   
   current: null,
   
   // -----------------------------
   // INIT
   // -----------------------------
   init() {
      this.newExercise();
      this.updateStats();
   },
   
   // -----------------------------
   // NOVO EXERCÍCIO
   // -----------------------------
   newExercise() {
      
      const ex = getAdaptiveExercise(Progress);
      
      if (!ex || typeof ex !== "object") {
         console.error("Falha ao gerar exercício");
         this.renderFeedback("Erro ao carregar exercício", "err");
         return;
      }
      
      this.current = ex;
      
      UI.mount("exerciseContainer",
         ExerciseCard({
            question: ex.question || ""
         })
      );
      
      this.clearFeedback();
   },
   
   // -----------------------------
   // CHECK
   // -----------------------------
   check() {
      
      if (!this.current) {
         console.warn("Sem exercício ativo");
         return;
      }
      
      const inputEl = $("answer");
      if (!inputEl) { // CORREÇÃO: validação de elemento
         this.renderFeedback("Campo de resposta não encontrado", "err");
         return;
      }
      
      const rawInput = inputEl.value || ""; // CORREÇÃO: proteção contra undefined
      
      const userValue = EngineMath.parse(rawInput);
      
      if (typeof userValue !== "number" || !Number.isFinite(userValue)) { // CORREÇÃO: Number.isFinite
         this.renderFeedback("Digite um número válido", "err");
         return;
      }
      
      const result = (typeof this.current.solve === "function") ? this.current.solve() : null; // CORREÇÃO: validação de função
      
      if (!result || typeof result.value !== "number" || !Number.isFinite(result.value)) { // CORREÇÃO: validação robusta
         console.error("Exercício retornou valor inválido", result);
         this.renderFeedback("Erro interno no exercício", "err");
         return;
      }
      
      const ok = EngineMath.isClose(userValue, result.value);
      
      if (typeof this.current.type === "string") {
         Progress.update(this.current.type, ok);
      } else {
         console.warn("Tipo inválido:", this.current);
      }
      
      this.renderFeedback(
         ok ?
         "✔ Correto!" :
         `✖ Errado<br>${this.current.formula || ""}<br>Resposta: ${result.display || result.value}`,
         ok ? "ok" : "err"
      );
      
      this.animateCard(ok);
      this.updateStats();
   },
   
   // -----------------------------
   // UI HELPERS
   // -----------------------------
   renderFeedback(message, type) {
      UI.mount("feedback", Feedback({ message, type }));
   },
   
   clearFeedback() {
      UI.mount("feedback", "");
   },
   
   updateStats() {
      
      const p = (typeof Progress.load === "function") ? Progress.load() : { total: 0, correct: 0 }; // CORREÇÃO: validação de função
      
      UI.mount("statsContainer",
         DashboardStats({
            acc: (typeof Progress.accuracy === "function") ? Progress.accuracy() : 0, // CORREÇÃO
            total: (p && typeof p.total === "number") ? p.total : 0, // CORREÇÃO: validação numérica
            correct: (p && typeof p.correct === "number") ? p.correct : 0 // CORREÇÃO
         })
      );
   },
   
   // -----------------------------
   // ANIMAÇÃO
   // -----------------------------
   animateCard(ok) {
      
      const card = document.querySelector("#exerciseContainer .card");
      if (!card) return;
      
      card.classList.remove("success", "error");
      
      if (ok) {
         card.classList.add("success");
      } else {
         card.classList.add("error");
         setTimeout(() => {
            if (card) card.classList.remove("error");
         }, 400);
      }
   }
   
};

// -----------------------------
// GLOBAL
// -----------------------------
window.newExercise = () => App.newExercise();
window.check = () => App.check();

// -----------------------------
// START
// -----------------------------
App.init();