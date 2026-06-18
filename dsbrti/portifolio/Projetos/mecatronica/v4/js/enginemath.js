// =============================
// ENGINE MATH (PURO E PREVISÍVEL)
// =============================

export const EngineMath = {
   
   // -----------------------------
   // NORMALIZA INPUT DO USUÁRIO
   // -----------------------------
   parse(value) {
      if (value === null || value === undefined) return NaN;
      
      let v = String(value).trim();
      
      if (!v) return NaN;
      
      // vírgula → ponto (global)
      v = v.replace(/,/g, ".");
      
      // remove unidade
      v = v.replace(/[a-zA-ZΩ]/g, "");
      
      if (!v) return NaN;
      
      // fração simples (ex: 1/2)
      if (v.includes("/")) {
         const parts = v.split("/");
         if (parts.length === 2) {
            const a = Number(parts[0]);
            const b = Number(parts[1]);
            
            if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) { // CORREÇÃO
               return a / b;
            }
         }
         return NaN;
      }
      
      // raiz simples (ex: sqrt(2))
      if (/^sqrt\(.+\)$/.test(v)) {
         const inner = v.slice(5, -1);
         const n = Number(inner);
         
         if (Number.isFinite(n) && n >= 0) { // CORREÇÃO
            return Math.sqrt(n);
         }
         return NaN;
      }
      
      const num = Number(v);
      return Number.isFinite(num) ? num : NaN; // CORREÇÃO
   },
   
   // -----------------------------
   // PADRONIZA RESULTADO
   // -----------------------------
   result(value, display = null, steps = null, meta = null) {
      const num = Number(value);
      
      return {
         value: Number.isFinite(num) ? num : NaN, // CORREÇÃO
         display: display != null ? String(display) : String(num),
         steps,
         meta
      };
   },
   
   // -----------------------------
   // COMPARAÇÃO NUMÉRICA
   // -----------------------------
   isClose(user, correct, tolerance = 0.01) {
      if (
         typeof correct !== "number" || !Number.isFinite(correct) || // CORREÇÃO
         typeof user !== "number" || !Number.isFinite(user) // CORREÇÃO
      ) {
         return false;
      }
      
      const error = Math.abs(user - correct);
      const scale = Math.max(1, Math.abs(correct));
      
      return error <= scale * tolerance;
   }
   
};