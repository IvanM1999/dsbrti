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
   
   history: []
};

let listeners = [];

export function getState() {
   return state;
}

export function setState(partial) {
   
   state = {
      ...state,
      ...partial
   };
   
   notify();
}

export function updateStats(isCorrect, exercise) {
   
   const stats = { ...state.stats };
   
   stats.total++;
   
   if (isCorrect) {
      stats.correct++;
      stats.streak++;
      stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
   } else {
      stats.streak = 0;
   }
   
   const history = [
      ...state.history,
      {
         correct: isCorrect,
         type: exercise.meta?.type,
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
   
   const acc = stats.correct / stats.total;
   
   if (acc > 0.8) return 3;
   if (acc > 0.5) return 2;
   return 1;
}

export function subscribe(fn) {
   listeners.push(fn);
}

function notify() {
   listeners.forEach(fn => fn(state));
}