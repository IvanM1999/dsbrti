export const Ranking = {
   
   key: "circuitlab_ranking",
   
   load() {
      return JSON.parse(localStorage.getItem(this.key)) || [];
   },
   
   save(list) {
      localStorage.setItem(this.key, JSON.stringify(list));
   },
   
   add(score) {
      const list = this.load();
      
      list.push({
         score,
         date: new Date().toLocaleString()
      });
      
      // ordena do maior para menor
      list.sort((a, b) => b.score - a.score);
      
      // mantém só top 5
      const top = list.slice(0, 5);
      
      this.save(top);
      
      return top;
   },
   
   medal(score) {
      if (score >= 100) return "🥇 Ouro";
      if (score >= 60) return "🥈 Prata";
      if (score >= 30) return "🥉 Bronze";
      return "—";
   }
   
};

export const Ranking = {

  key: "circuitlab_ranking",

  load() {
    return JSON.parse(localStorage.getItem(this.key)) || [];
  },

  save(list) {
    localStorage.setItem(this.key, JSON.stringify(list));
  },

  add(score) {
    const list = this.load();

    list.push({
      score,
      date: new Date().toLocaleString()
    });

    list.sort((a, b) => b.score - a.score);

    const top = list.slice(0, 5);

    this.save(top);

    return top;
  },

  medal(score) {
    if (score >= 100) return "🥇";
    if (score >= 60) return "🥈";
    if (score >= 30) return "🥉";
    return "-";
  }

};