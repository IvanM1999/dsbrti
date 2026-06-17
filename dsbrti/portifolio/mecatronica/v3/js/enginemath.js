// =============================
// ENGINE MATH (PURO E PREVISÍVEL)
// =============================

export const EngineMath = {
   
   // -----------------------------
   // NORMALIZA INPUT DO USUÁRIO
   // -----------------------------
   parse(value) {
      if (value === null || value === undefined) return NaN;
      
      let v = value.toString().trim();
      
      // vírgula → ponto
      v = v.replace(",", ".");
      
      // remove unidade (validador cuida disso depois)
      v = v.replace(/[a-zA-ZΩ]/g, "");
      
      // fração simples (ex: 1/2)
      if (v.includes("/")) {
         const [a, b] = v.split("/").map(Number);
         if (!isNaN(a) && !isNaN(b) && b !== 0) {
            return a / b;
         }
      }
      
      // raiz simples (ex: sqrt(2))
      if (v.startsWith("sqrt")) {
         const n = Number(v.replace(/[^\d.]/g, ""));
         if (!isNaN(n)) return Math.sqrt(n);
      }
      
      const num = Number(v);
      return isNaN(num) ? NaN : num;
   },
   
   // -----------------------------
   // PADRONIZA RESULTADO
   // -----------------------------
   result(value, display = null, steps = null, meta = null) {
      return {
         value: Number(value),
         display: display ?? String(value),
         steps,
         meta
      };
   },
   
   // -----------------------------
   // COMPARAÇÃO NUMÉRICA
   // -----------------------------
   isClose(user, correct, tolerance = 0.01) {
      if (typeof correct !== "number" || isNaN(correct)) return false;
      if (typeof user !== "number" || isNaN(user)) return false;
      
      const error = Math.abs(user - correct);
      const scale = Math.max(1, Math.abs(correct));
      
      return error <= scale * tolerance;
   }
   
};<tag>
   Tab to edit
</tag>