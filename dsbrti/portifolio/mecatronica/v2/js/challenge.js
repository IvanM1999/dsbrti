import { Ranking } from './ranking.js';

export const Challenge = {
  
  active: false,
  time: 60,
  timer: null,
  score: 0,
  
  start(deps) {
    this.active = true;
    this.time = 60;
    this.score = 0;
    
    const { newExercise, updateTimer, feedback } = deps;
    
    updateTimer(this.time);
    feedback("Modo desafio iniciado!");
    
    this.timer = setInterval(() => {
      this.time--;
      
      updateTimer(this.time);
      
      if (this.time <= 0) {
        this.stop(deps);
      }
    }, 1000);
    
    newExercise();
  },
  
  stop(deps) {
    clearInterval(this.timer);
    this.active = false;
    
    const { feedback, updateRanking } = deps;
    
    const top = Ranking.add(this.score);
    
    feedback(`Tempo esgotado! Pontuação: ${this.score}`);
    
    if (updateRanking) updateRanking(top);
  },
  
  hit() {
    if (this.active) {
      this.score += 10;
    }
  }
  
};