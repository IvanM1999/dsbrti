// =============================
// VALIDATOR (ROBUSTO + DIDÁTICO)
// =============================

const UNIT_MAP = {
  A: 1,
  mA: 1e-3,
  kA: 1e3,
  
  V: 1,
  mV: 1e-3,
  kV: 1e3,
  
  ohm: 1,
  kohm: 1e3,
  mohm: 1e6
};

// -----------------------------
// NORMALIZA UNIDADE
// -----------------------------
function normalizeUnit(u = "") {
  if (typeof u !== "string") return ""; // CORREÇÃO
  return u
    .replace(/kΩ/gi, "kohm") // CORREÇÃO: ordem correta
    .replace(/MΩ/gi, "mohm") // CORREÇÃO
    .replace(/Ω/gi, "ohm") // CORREÇÃO
    .toLowerCase()
    .trim();
}

export const Validator = {
  
  // -----------------------------
  // PARSE (valor + unidade)
  // -----------------------------
  parse(input) {
    
    if (input === null || input === undefined) return null; // CORREÇÃO
    
    const clean = String(input)
      .replace(",", ".")
      .trim();
    
    if (!clean) return null; // CORREÇÃO
    
    const match = clean.match(/^(-?\d+(\.\d+)?)(\s*[a-zA-ZΩ]*)$/);
    
    if (!match) return null;
    
    const value = Number(match[1]);
    let unit = match[3] ? match[3].trim() : "";
    
    if (!Number.isFinite(value)) return null; // CORREÇÃO
    
    if (!unit) return value;
    
    unit = normalizeUnit(unit);
    
    const factor = UNIT_MAP[unit];
    
    if (typeof factor !== "number") return value; // CORREÇÃO
    
    return value * factor;
  },
  
  // -----------------------------
  // COMPARAÇÃO
  // -----------------------------
  isClose(user, expected, tol = 0.05) {
    
    if (
      typeof user !== "number" || !Number.isFinite(user) ||
      typeof expected !== "number" || !Number.isFinite(expected)
    ) {
      return false; // CORREÇÃO
    }
    
    const error = Math.abs(user - expected);
    const limit = Math.max(1, Math.abs(expected)) * tol;
    
    return error <= limit;
  },
  
  // -----------------------------
  // VALIDAÇÃO + DIAGNÓSTICO
  // -----------------------------
  validate(userInput, result) {
    
    if (!result || typeof result !== "object") { // CORREÇÃO
      return {
        correct: false,
        message: "Resultado inválido",
        type: "error"
      };
    }
    
    const user = this.parse(userInput);
    const expected = result.value;
    
    if (user === null || !Number.isFinite(user)) {
      return {
        correct: false,
        message: "Resposta inválida",
        type: "error"
      };
    }
    
    if (typeof expected !== "number" || !Number.isFinite(expected)) { // CORREÇÃO
      return {
        correct: false,
        message: "Resultado esperado inválido",
        type: "error"
      };
    }
    
    const ok = this.isClose(user, expected);
    
    if (ok) {
      return {
        correct: true,
        message: `✔ Correto: ${result.display}`,
        type: "success"
      };
    }
    
    // =============================
    // DIAGNÓSTICO GUIADO
    // =============================
    let hint = "";
    let guidance = "";
    
    const ratio = expected !== 0 ? user / expected : NaN; // CORREÇÃO
    
    // 🔹 unidade
    if (Number.isFinite(ratio) && Math.abs(ratio) > 0.9 && Math.abs(ratio) < 1.1) { // CORREÇÃO
      hint = "⚠ Unidade incorreta";
      guidance = "Revise A, mA, kA ou Ω, kΩ...";
    }
    
    // 🔹 escala (10x / 100x)
    else if (Number.isFinite(ratio) && Math.abs(ratio) > 0) { // CORREÇÃO
      const log = Math.log10(Math.abs(ratio));
      if (Number.isFinite(log)) {
        const absLog = Math.abs(log);
        if (absLog >= 0.9 && absLog <= 2.1) {
          hint = "⚠ Erro de escala";
          guidance = "Possível fator ×10 ou ×100";
        }
      }
    }
    
    // 🔹 paralelo errado
    else if (result.meta && result.meta.type === "parallel") {
      
      const values = Array.isArray(result.meta.values) ? result.meta.values : []; // CORREÇÃO
      const sum = values.reduce((a, b) => (Number.isFinite(b) ? a + b : a), 0); // CORREÇÃO
      
      if (sum !== 0 && Math.abs(user - sum) / Math.abs(sum) < 0.1) { // CORREÇÃO
        hint = "⚠ Você somou resistores";
        guidance = `
          Passo correto:
          1. Calcular 1/R de cada resistor
          2. Somar os inversos
          3. Inverter o resultado
        `;
      }
    }
    
    // 🔹 série errada
    else if (result.meta && result.meta.type === "series") {
      
      const values = Array.isArray(result.meta.values) ? result.meta.values : []; // CORREÇÃO
      
      const inv = values.reduce((acc, r) => {
        return (Number.isFinite(r) && r !== 0) ? acc + (1 / r) : acc;
      }, 0); // CORREÇÃO
      
      if (inv !== 0 && Number.isFinite(inv)) {
        const parallel = 1 / inv;
        
        if (Number.isFinite(parallel) && parallel !== 0) {
          if (Math.abs(user - parallel) / Math.abs(parallel) < 0.1) {
            hint = "⚠ Você fez paralelo";
            guidance = `
              Passo correto:
              1. Somar resistores diretamente
            `;
          }
        }
      }
    }
    
    // 🔹 fallback → usa steps do engine
    if (!guidance && Array.isArray(result.steps)) { // CORREÇÃO
      guidance = `
        Caminho correto:
        ${result.steps.map(s => `• ${String(s)}`).join("<br>")} 
      `;
    }
    
    return {
      correct: false,
      message: `
        ❌ Errado<br>
        Sua resposta: ${userInput}<br>
        Esperado: ${result.display}<br><br>
        ${hint}<br>
        ${guidance}
      `,
      type: "error"
    };
  }
  
};