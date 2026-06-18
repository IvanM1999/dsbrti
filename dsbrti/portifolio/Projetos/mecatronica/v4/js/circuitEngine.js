// =============================
// CIRCUIT ENGINE (SIMPLIFICADO)
// =============================

export const CircuitEngine = {
   
   // -----------------------------
   // CALCULA RESISTÊNCIA EQUIVALENTE
   // -----------------------------
   equivalent(components) {
      
      if (!Array.isArray(components)) return 0;
      
      const resistors = components.filter(c =>
         c &&
         c.type === "resistor" &&
         typeof c.value === "number" &&
         Number.isFinite(c.value) && // CORREÇÃO: uso de Number.isFinite
         c.value > 0
      );
      
      if (!resistors.length) return 0;
      
      const sameNodes = this._isParallel(resistors);
      
      if (sameNodes) {
         const inv = resistors.reduce((acc, r) => {
            return acc + (1 / r.value);
         }, 0);
         
         return (inv > 0 && Number.isFinite(inv)) ? (1 / inv) : 0; // CORREÇÃO
      }
      
      return resistors.reduce((sum, r) => sum + r.value, 0);
   },
   
   // -----------------------------
   // CORRENTE TOTAL
   // -----------------------------
   current(components) {
      
      if (!Array.isArray(components)) return null;
      
      const source = components.find(c =>
         c &&
         c.type === "source" &&
         typeof c.value === "number" &&
         Number.isFinite(c.value) // CORREÇÃO
      );
      
      if (!source) {
         console.warn("Sem fonte no circuito");
         return null;
      }
      
      const Req = this.equivalent(components);
      
      if (typeof Req !== "number" || !Number.isFinite(Req) || Req <= 0) { // CORREÇÃO
         return null;
      }
      
      const I = source.value / Req;
      
      if (!Number.isFinite(I)) return null; // CORREÇÃO
      
      return {
         value: I,
         display: I.toFixed(2)
      };
   },
   
   // -----------------------------
   // DETECTA PARALELO
   // -----------------------------
   _isParallel(resistors) {
      
      if (!Array.isArray(resistors) || resistors.length < 2) return false;
      
      const base = resistors[0];
      
      if (!base || base.n1 == null || base.n2 == null) return false;
      
      const { n1, n2 } = base;
      
      return resistors.every(r =>
         r &&
         r.n1 != null &&
         r.n2 != null &&
         (
            (r.n1 === n1 && r.n2 === n2) ||
            (r.n1 === n2 && r.n2 === n1)
         )
      );
   }
   
};