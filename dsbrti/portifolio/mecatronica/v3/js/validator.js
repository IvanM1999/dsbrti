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
  return u
    .replace("Ω", "ohm")
    .replace("kΩ", "kohm")
    .replace("MΩ", "mohm")
    .toLowerCase()
    .trim();
}

export const Validator = {

  // -----------------------------
  // PARSE (valor + unidade)
  // -----------------------------
  parse(input) {

    if (!input) return null;

    const clean = input
      .replace(",", ".")
      .trim();

    const match = clean.match(/^(-?\d+(\.\d+)?)(\s*[a-zA-ZΩ]*)$/);

    if (!match) return null;

    const value = Number(match[1]);
    let unit = match[3]?.trim();

    if (!unit) return value;

    unit = normalizeUnit(unit);

    const factor = UNIT_MAP[unit];

    if (!factor) return value; // fallback seguro

    return value * factor;
  },

  // -----------------------------
  // COMPARAÇÃO
  // -----------------------------
  isClose(user, expected, tol = 0.05) {

    const error = Math.abs(user - expected);
    const limit = Math.max(1, Math.abs(expected)) * tol;

    return error <= limit;
  },

  // -----------------------------
  // VALIDAÇÃO + DIAGNÓSTICO
  // -----------------------------
  validate(userInput, result) {

    const user = this.parse(userInput);
    const expected = result.value;

    if (user === null || isNaN(user)) {
      return {
        correct: false,
        message: "Resposta inválida",
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

    const ratio = user / expected;

    // 🔹 unidade
    if (ratio > 0.9 && ratio < 1.1) {
      hint = "⚠ Unidade incorreta";
      guidance = "Revise A, mA, kA ou Ω, kΩ...";
    }

    // 🔹 escala (10x / 100x)
    else if (
      Math.abs(Math.log10(Math.abs(ratio))) >= 0.9 &&
      Math.abs(Math.log10(Math.abs(ratio))) <= 2.1
    ) {
      hint = "⚠ Erro de escala";
      guidance = "Possível fator ×10 ou ×100";
    }

    // 🔹 paralelo errado
    else if (result.meta?.type === "parallel") {

      const values = result.meta.values || [];
      const sum = values.reduce((a, b) => a + b, 0);

      if (Math.abs(user - sum) / sum < 0.1) {
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
    else if (result.meta?.type === "series") {

      const values = result.meta.values || [];

      const inv = values.reduce((acc, r) => acc + (1 / r), 0);
      const parallel = 1 / inv;

      if (Math.abs(user - parallel) / parallel < 0.1) {
        hint = "⚠ Você fez paralelo";
        guidance = `
          Passo correto:
          1. Somar resistores diretamente
        `;
      }
    }

    // 🔹 fallback → usa steps do engine
    if (!guidance && result.steps) {
      guidance = `
        Caminho correto:
        ${result.steps.map(s => `• ${s}`).join("<br>")}
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