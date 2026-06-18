import { Ranking } from './ranking.js';

export const Challenge = {
  
  active: false,
  time: 60,
  timer: null,
  score: 0,
  
  start(deps) {
    
    if (!deps || typeof deps !== "object") return;
    
    const { newExercise, updateTimer, feedback } = deps;
    
    if (typeof updateTimer !== "function" || typeof feedback !== "function") {
      console.error("Dependências inválidas em Challenge.start");
      return;
    }
    
    // evita múltiplos timers
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.active = true;
    this.time = 60;
    this.score = 0;
    
    updateTimer(this.time);
    feedback("Modo desafio iniciado!");
    
    this.timer = setInterval(() => {
      
      if (!this.active) return;
      
      this.time = Math.max(0, this.time - 1);
      
      updateTimer(this.time);
      
      if (this.time === 0) {
        this.stop(deps);
      }
      
    }, 1000);
    
    if (typeof newExercise === "function") {
      newExercise();
    }
  },
  
  stop(deps) {
    
    if (!this.active) return;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.active = false;
    
    const { feedback, updateRanking } = (deps && typeof deps === "object") ? deps: {}; // CORREÇÃO: validação de deps
    
    const top = (Ranking && typeof Ranking.add === "function") ?
      Ranking.add(this.score) :
      null;
    
    if (typeof feedback === "function") {
      feedback(`Tempo esgotado! Pontuação: ${this.score}`);
    }
    
    if (typeof updateRanking === "function") {
      updateRanking(top);
    }
  },
  
  hit() {
    if (this.active) {
      this.score = Number.isFinite(this.score) ? this.score + 10 : 10; // CORREÇÃO: proteção contra NaN
    }
  }
  
};