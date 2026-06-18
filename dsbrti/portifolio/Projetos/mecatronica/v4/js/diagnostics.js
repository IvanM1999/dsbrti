// =============================
// DIAGNÓSTICO DE ERRO
// =============================

export function analyzeError(user, expected, result) {
   
   if (
      typeof user !== "number" || !Number.isFinite(user) || // CORREÇÃO
      typeof expected !== "number" || !Number.isFinite(expected) || // CORREÇÃO
      expected === 0
   ) {
      return "unknown";
   }
   
   const ratio = user / expected;
   
   if (!Number.isFinite(ratio) || ratio === 0) { // CORREÇÃO
      return "unknown";
   }
   
   const absRatio = Math.abs(ratio);
   
   // -------------------------
   // UNIDADE
   // -------------------------
   if (absRatio > 0.9 && absRatio < 1.1) {
      return "unit";
   }
   
   // -------------------------
   // ESCALA
   // -------------------------
   const log = Math.log10(absRatio);
   
   if (Number.isFinite(log)) { // CORREÇÃO
      const absLog = Math.abs(log);
      
      if (absLog >= 0.9 && absLog <= 2.1) {
         return "scale";
      }
   }
   
   const meta = (result && typeof result === "object" && result.meta) ? result.meta : null; // CORREÇÃO
   
   // -------------------------
   // PARALELO ERRADO
   // -------------------------
   if (meta && meta.type === "parallel" && Array.isArray(meta.values)) {
      
      const values = meta.values.filter(v => typeof v === "number" && Number.isFinite(v)); // CORREÇÃO
      
      if (values.length) {
         const sum = values.reduce((a, b) => a + b, 0);
         
         if (sum !== 0 && Number.isFinite(sum)) { // CORREÇÃO
            if (Math.abs(user - sum) / Math.abs(sum) < 0.1) {
               return "parallel_as_series";
            }
         }
      }
   }
   
   // -------------------------
   // SÉRIE ERRADA
   // -------------------------
   if (meta && meta.type === "series" && Array.isArray(meta.values)) {
      
      const values = meta.values.filter(v =>
         typeof v === "number" && Number.isFinite(v) && v !== 0 // CORREÇÃO
      );
      
      if (values.length) {
         const inv = values.reduce((acc, r) => acc + (1 / r), 0);
         
         if (inv !== 0 && Number.isFinite(inv)) { // CORREÇÃO
            const parallel = 1 / inv;
            
            if (Number.isFinite(parallel) && parallel !== 0) { // CORREÇÃO
               if (Math.abs(user - parallel) / Math.abs(parallel) < 0.1) {
                  return "series_as_parallel";
               }
            }
         }
      }
   }
   
   return "unknown";
}