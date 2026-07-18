export const Progress = {
   
   key: "progress",
   
   // estrutura padrão
   base() {
      return {
         total: 0,
         correct: 0,
         topics: {}
      };
   },
   
   load() {
      try {
         const data = JSON.parse(localStorage.getItem(this.key));
         return data || this.base();
      } catch (e) {
         console.warn("Erro ao carregar progresso, resetando...");
         return this.base();
      }
   },
   
   save(data) {
      localStorage.setItem(this.key, JSON.stringify(data));
   },
   
   update(topic, isCorrect) {
      
      const p = this.load();
      
      p.total += 1;
      
      if (isCorrect) {
         p.correct += 1;
      }
      
      // garante estrutura do tópico
      if (!p.topics[topic]) {
         p.topics[topic] = {
            total: 0,
            correct: 0
         };
      }
      
      p.topics[topic].total += 1;
      
      if (isCorrect) {
         p.topics[topic].correct += 1;
      }
      
      this.save(p);
   },
   
   accuracy() {
      const p = this.load();
      
      if (p.total === 0) return 0;
      
      return ((p.correct / p.total) * 100).toFixed(1);
   },
   
   topicAccuracy(topic) {
      const p = this.load();
      
      const t = p.topics[topic];
      
      if (!t || t.total === 0) return 0;
      
      return ((t.correct / t.total) * 100).toFixed(1);
   },
   
   reset() {
      localStorage.removeItem(this.key);
   }
   
};