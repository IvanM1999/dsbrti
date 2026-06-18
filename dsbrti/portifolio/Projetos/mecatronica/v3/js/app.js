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
      
      if (!ex) {
         console.error("Falha ao gerar exercício");
         this.renderFeedback("Erro ao carregar exercício", "err");
         return;
      }
      
      this.current = ex;
      
      UI.mount("exerciseContainer",
         ExerciseCard({
            question: ex.question
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
      
      const rawInput = $("answer")?.value;
      const userValue = EngineMath.parse(rawInput);
      
      if (isNaN(userValue)) {
         this.renderFeedback("Digite um número válido", "err");
         return;
      }
      
      const result = this.current.solve();
      
      if (!result || typeof result.value !== "number") {
         console.error("Exercício retornou valor inválido", result);
         this.renderFeedback("Erro interno no exercício", "err");
         return;
      }
      
      const ok = EngineMath.isClose(userValue, result.value);
      
      // proteção contra type inválido
      if (typeof this.current.type === "string") {
         Progress.update(this.current.type, ok);
      } else {
         console.warn("Tipo inválido:", this.current);
      }
      
      this.renderFeedback(
         ok ?
         "✔ Correto!" :
         `✖ Errado<br>${this.current.formula}<br>Resposta: ${result.display}`,
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
      
      const p = Progress.load();
      
      UI.mount("statsContainer",
         DashboardStats({
            acc: Progress.accuracy(),
            total: p.total,
            correct: p.correct
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
         setTimeout(() => card.classList.remove("error"), 400);
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


import { UI, ExerciseCard, Feedback, Steps } from "./ui.js";
import { getAdaptiveExercise } from "./engine.js";
import { Validator } from "./validator.js";

// estado atual
let currentExercise = null;
let currentResult = null;

// =============================
// NOVO EXERCÍCIO
// =============================
window.newExercise = function () {

  currentExercise = getAdaptiveExercise(window.Progress);

  if (!currentExercise) return;

  UI.mount("app", ExerciseCard({
    question: currentExercise.question
  }));

  currentResult = currentExercise.solve();
};

// =============================
// VERIFICAR RESPOSTA
// =============================
window.check = function () {

  if (!currentExercise) return;

  const input = document.getElementById("answer")?.value;

  const validation = Validator.validate(input, currentResult);

  let html = Feedback({
    message: validation.message,
    type: validation.type
  });

  // mostra steps se existir
  if (currentResult.steps) {
    html += Steps(currentResult.steps);
  }

  UI.mount("feedback", html);

  // registra progresso (se existir)
  if (window.Progress && currentExercise.type) {
    window.Progress.addAttempt(
      currentExercise.type,
      validation.correct
    );
  }
};

import { UI, ExerciseCard, Feedback, Steps, DashboardStats } from "./ui.js";
import { setState, getState, subscribe, updateStats } from "./store.js";
import { Validator } from "./validator.js";
import { generateExercise } from "./engine.js";
import { registerAction } from "./ui.js";

// INIT
function init() {

  const { difficulty } = getState();

  setState({
    exercise: generateExercise(difficulty)
  });

}

// RENDER
function render(state) {

  const { exercise, feedback, stats } = state;

  const acc = stats.total
    ? (stats.correct / stats.total) * 100
    : 0;

  UI.mount("app", `
    ${DashboardStats({
      acc,
      total: stats.total,
      correct: stats.correct
    })}

    ${ExerciseCard({ question: exercise.question })}

    ${feedback ? Feedback(feedback) : ""}

    ${Steps(exercise.steps)}
  `);

}

// ACTION: CHECK
registerAction("check", () => {

  const input = document.getElementById("answer").value;
  const { exercise } = getState();

  const result = Validator.validate(input, exercise);

  setState({ feedback: result });

  updateStats(result.correct, exercise);

});

// ACTION: NEW
registerAction("newExercise", () => {

  const { difficulty } = getState();

  setState({
    exercise: generateExercise(difficulty),
    feedback: null
  });

});

// BOOT
subscribe(render);
init();