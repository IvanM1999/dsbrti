export const Ranking = {
  
  key: "circuitlab_ranking",
  
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : []; // CORREÇÃO
    } catch (e) {
      console.warn("Erro ao carregar ranking:", e); // CORREÇÃO
      return [];
    }
  },
  
  save(list) {
    if (!Array.isArray(list)) return; // CORREÇÃO
    try {
      localStorage.setItem(this.key, JSON.stringify(list));
    } catch (e) {
      console.warn("Erro ao salvar ranking:", e); // CORREÇÃO
    }
  },
  
  add(score) {
    const list = this.load();
    
    const safeScore = (typeof score === "number" && Number.isFinite(score)) ? score : 0; // CORREÇÃO
    
    list.push({
      score: safeScore,
      date: new Date().toLocaleString()
    });
    
    // ordena do maior para menor
    list.sort((a, b) => {
      const sa = (a && typeof a.score === "number") ? a.score : 0; // CORREÇÃO
      const sb = (b && typeof b.score === "number") ? b.score : 0; // CORREÇÃO
      return sb - sa;
    });
    
    // mantém só top 5
    const top = list.slice(0, 5);
    
    this.save(top);
    
    return top;
  },
  
  medal(score) {
    if (typeof score !== "number" || !Number.isFinite(score)) return "-"; // CORREÇÃO
    if (score >= 100) return "🥇";
    if (score >= 60) return "🥈";
    if (score >= 30) return "🥉";
    return "-";
  }
  
};