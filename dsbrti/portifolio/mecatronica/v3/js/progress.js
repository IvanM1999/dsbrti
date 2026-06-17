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
        ...data,
        topics: data.topics || {}
      };
      
      return this._cache;
      
    } catch (e) {
      console.warn("Erro ao carregar progresso, resetando...");
      this._cache = this.base();
      return this._cache;
    }
  },
  
  save(data) {
    this._cache = data;
    localStorage.setItem(this.key, JSON.stringify(data));
  },
  
  update(topic, isCorrect) {
    
    if (!topic || typeof topic !== "string") {
      console.warn("Topic inválido:", topic);
      return;
    }
    
    const p = this.load();
    
    p.total++;
    
    if (isCorrect) {
      p.correct++;
      p.streak++;
    } else {
      p.streak = 0;
    }
    
    if (p.streak > p.bestStreak) {
      p.bestStreak = p.streak;
    }
    
    if (!p.topics[topic]) {
      p.topics[topic] = { total: 0, correct: 0 };
    }
    
    p.topics[topic].total++;
    
    if (isCorrect) {
      p.topics[topic].correct++;
    }
    
    this.save(p);
  },
  
  accuracy() {
    const p = this.load();
    if (p.total === 0) return 0;
    return (p.correct / p.total) * 100;
  },
  
  topicAccuracy(topic) {
    const p = this.load();
    const t = p.topics[topic];
    if (!t || t.total === 0) return 0;
    return (t.correct / t.total) * 100;
  },
  
  level() {
    const p = this.load();
    return Math.floor(p.correct / 10) + 1;
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
      total: p.total,
      correct: p.correct,
      accuracy: this.accuracy(),
      level: this.level(),
      medal: this.medal(),
      streak: p.streak,
      bestStreak: p.bestStreak
    };
  },
  
  reset() {
    this._cache = null;
    localStorage.removeItem(this.key);
  }
  
};