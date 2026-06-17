// =============================
// STORE (estado com treino)
// =============================

let state = {
   
   exercise: null,
   feedback: null,
   
   stats: {
      total: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0
   },
   
   difficulty: 1, // 1 = fácil, 2 = médio, 3 = difícil
   
   history: [],
   
   weakness: { // CORREÇÃO: movido para dentro do state válido
      unit: 0,
      scale: 0,
      parallel_as_series: 0,
      series_as_parallel: 0
   }
};

let listeners = [];

export function getState() {
   return state;
}

export function setState(partial) {
   
   if (!partial || typeof partial !== "object") return; // CORREÇÃO
   
   state = {
      ...state,
      ...partial
   };
   
   notify();
}

export function updateStats(isCorrect, exercise) {
   
   const stats = { ...state.stats };
   
   stats.total = (typeof stats.total === "number" ? stats.total : 0) + 1; // CORREÇÃO
   
   if (isCorrect) {
      stats.correct = (typeof stats.correct === "number" ? stats.correct : 0) + 1; // CORREÇÃO
      stats.streak = (typeof stats.streak === "number" ? stats.streak : 0) + 1; // CORREÇÃO
      stats.bestStreak = Math.max(stats.bestStreak || 0, stats.streak); // CORREÇÃO
   } else {
      stats.streak = 0;
   }
   
   const history = [
      ...state.history,
      {
         correct: isCorrect,
         type: exercise && exercise.meta ? exercise.meta.type : undefined, // CORREÇÃO
         timestamp: Date.now()
      }
   ];
   
   state = {
      ...state,
      stats,
      history,
      difficulty: adjustDifficulty(stats)
   };
   
   notify();
}

// -----------------------------
// DIFICULDADE DINÂMICA
// -----------------------------
function adjustDifficulty(stats) {
   
   if (!stats || typeof stats.total !== "number" || stats.total === 0) return 1; // CORREÇÃO
   
   const acc = stats.correct / stats.total;
   
   if (acc > 0.8) return 3;
   if (acc > 0.5) return 2;
   return 1;
}

export function subscribe(fn) {
   if (typeof fn === "function") { // CORREÇÃO
      listeners.push(fn);
   }
}

function notify() {
   listeners.forEach(fn => {
      if (typeof fn === "function") fn(state); // CORREÇÃO
   });
}

import { analyzeError } from "./diagnostics.js";

export function updateLearning(userInput, result, exercise) {
  
  const user = Number(userInput);
  
  if (!result || typeof result !== "object" || result.correct !== false) return; // CORREÇÃO

  if (!Number.isFinite(user) || typeof result.value !== "number" || !Number.isFinite(result.value)) return; // CORREÇÃO

  const errorType = analyzeError(user, result.value, exercise);

  const weakness = { ...state.weakness };

  if (errorType && weakness[errorType] !== undefined) {
    weakness[errorType]++;
  }

  state = {
    ...state,
    weakness
  };

  notify(); // CORREÇÃO: garante atualização
}