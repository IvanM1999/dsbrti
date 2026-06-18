// =============================
// CIRCUIT ENGINE (SIMPLIFICADO)
// =============================

export const CircuitEngine = {
   
   // -----------------------------
   // CALCULA RESISTÊNCIA EQUIVALENTE
   // -----------------------------
   equivalent(components) {
      
      const resistors = components.filter(c => c.type === "resistor");
      
      if (!resistors.length) return 0;
      
      // heurística simples:
      // se todos compartilham nós → paralelo
      const sameNodes = this._isParallel(resistors);
      
      if (sameNodes) {
         const inv = resistors.reduce((acc, r) => acc + (1 / r.value), 0);
         return 1 / inv;
      }
      
      // fallback: série
      return resistors.reduce((sum, r) => sum + r.value, 0);
   },
   
   // -----------------------------
   // CORRENTE TOTAL
   // -----------------------------
   current(components) {
      
      const source = components.find(c => c.type === "source");
      
      if (!source) {
         console.warn("Sem fonte no circuito");
         return null;
      }
      
      const Req = this.equivalent(components);
      
      if (!Req) return null;
      
      const I = source.value / Req;
      
      return {
         value: I,
         display: I.toFixed(2)
      };
   },
   
   // -----------------------------
   // DETECTA PARALELO
   // -----------------------------
   _isParallel(resistors) {
      
      if (resistors.length < 2) return false;
      
      const { n1, n2 } = resistors[0];
      
      return resistors.every(r =>
         (r.n1 === n1 && r.n2 === n2) ||
         (r.n1 === n2 && r.n2 === n1)
      );
   }
   
};