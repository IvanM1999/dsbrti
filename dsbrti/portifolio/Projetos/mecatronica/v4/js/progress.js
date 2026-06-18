export const Progress = {
  
  key: "progress",
  _cache: null,
  
  base() {
    return {
      total: 0,
      correct: 0,
      topics: {},
      streak: 0,
      bestStreak: 0
    };
  },
  
  load() {
    
    if (this._cache) return this._cache;
    
    try {
      const raw = localStorage.getItem(this.key);
      
      if (!raw) {
        this._cache = this.base();
        return this._cache;
      }
      
      const data = JSON.parse(raw);
      
      this._cache = {
        ...this.base(),
        ...(data && typeof data === "object" ? data : {}), // CORREÇÃO
        topics: (data && typeof data.topics === "object") ? data.topics : {} // CORREÇÃO
      };
      
      return this._cache;
      
    } catch (e) {
      console.warn("Erro ao carregar progresso, resetando...");
      this._cache = this.base();
      return this._cache;
    }
  },
  
  save(data) {
    if (!data || typeof data !== "object") return; // CORREÇÃO
    this._cache = data;
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
      console.warn("Erro ao salvar progresso:", e); // CORREÇÃO
    }
  },
  
  update(topic, isCorrect) {
    
    if (!topic || typeof topic !== "string") {
      console.warn("Topic inválido:", topic);
      return;
    }
    
    const p = this.load();
    
    p.total = (typeof p.total === "number" && Number.isFinite(p.total)) ? p.total + 1 : 1; // CORREÇÃO
    
    if (isCorrect) {
      p.correct = (typeof p.correct === "number" && Number.isFinite(p.correct)) ? p.correct + 1 : 1; // CORREÇÃO
      p.streak = (typeof p.streak === "number" && Number.isFinite(p.streak)) ? p.streak + 1 : 1; // CORREÇÃO
    } else {
      p.streak = 0;
    }
    
    if (p.streak > p.bestStreak) {
      p.bestStreak = p.streak;
    }
    
    if (!p.topics[topic] || typeof p.topics[topic] !== "object") { // CORREÇÃO
      p.topics[topic] = { total: 0, correct: 0 };
    }
    
    p.topics[topic].total = (typeof p.topics[topic].total === "number" && Number.isFinite(p.topics[topic].total)) ? p.topics[topic].total + 1 : 1; // CORREÇÃO
    
    if (isCorrect) {
      p.topics[topic].correct = (typeof p.topics[topic].correct === "number" && Number.isFinite(p.topics[topic].correct)) ? p.topics[topic].correct + 1 : 1; // CORREÇÃO
    }
    
    this.save(p);
  },
  
  accuracy() {
    const p = this.load();
    if (typeof p.total !== "number" || p.total === 0) return 0; // CORREÇÃO
    return (p.correct / p.total) * 100;
  },
  
  topicAccuracy(topic) {
    const p = this.load();
    const t = p.topics[topic];
    if (!t || typeof t.total !== "number" || t.total === 0) return 0; // CORREÇÃO
    return (t.correct / t.total) * 100;
  },
  
  level() {
    const p = this.load();
    const correct = (typeof p.correct === "number" && Number.isFinite(p.correct)) ? p.correct : 0; // CORREÇÃO
    return Math.floor(correct / 10) + 1;
  },
  
  medal() {
    const acc = this.accuracy();
    
    if (acc >= 90) return "ouro";
    if (acc >= 75) return "prata";
    if (acc >= 50) return "bronze";
    
    return "nenhuma";
  },
  
  summary() {
    const p = this.load();
    
    return {
      total: (typeof p.total === "number" && Number.isFinite(p.total)) ? p.total : 0, // CORREÇÃO
      correct: (typeof p.correct === "number" && Number.isFinite(p.correct)) ? p.correct : 0, // CORREÇÃO
      accuracy: this.accuracy(),
      level: this.level(),
      medal: this.medal(),
      streak: (typeof p.streak === "number" && Number.isFinite(p.streak)) ? p.streak : 0, // CORREÇÃO
      bestStreak: (typeof p.bestStreak === "number" && Number.isFinite(p.bestStreak)) ? p.bestStreak : 0 // CORREÇÃO
    };
  },
  
  reset() {
    this._cache = null;
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
      console.warn("Erro ao resetar progresso:", e); // CORREÇÃO
    }
  }
  
};