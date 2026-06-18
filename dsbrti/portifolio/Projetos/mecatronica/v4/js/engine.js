// =============================
// NODAL ENGINE (UNIFICADO)
// =============================

export function solveNodalWithSteps(components) {

  const GND = "gnd";
  const steps = [];

  if (!Array.isArray(components)) {
    return { error: "Entrada inválida" };
  }

  const nodes = new Set();

  components.forEach(c => {
    if (!c) return;
    if (c.n1 && c.n1 !== GND) nodes.add(c.n1);
    if (c.n2 && c.n2 !== GND) nodes.add(c.n2);
  });

  const source = components.find(c =>
    c &&
    c.type === "source" &&
    typeof c.value === "number" &&
    Number.isFinite(c.value) // CORREÇÃO
  );

  if (!source) {
    return { error: "Sem fonte" };
  }

  if (source.n2 !== GND) {
    return { error: "Fonte deve estar no GND" };
  }

  const known = {};
  known[source.n1] = source.value;

  steps.push(`Fonte: V(${source.n1}) = ${source.value}V`);

  const unknownNodes = [...nodes].filter(n => !(n in known));

  // =============================
  // CASO SIMPLES (1 NÓ)
  // =============================
  if (unknownNodes.length === 1) {

    const n = unknownNodes[0];

    let sumG = 0;
    let sum = 0;
    let eq = [];

    components.forEach(c => {

      if (!c || c.type !== "resistor") return;
      if (typeof c.value !== "number" || !Number.isFinite(c.value) || c.value === 0) return; // CORREÇÃO

      if (c.n1 === n || c.n2 === n) {

        const other = c.n1 === n ? c.n2 : c.n1;
        const G = 1 / c.value;

        sumG += G;

        eq.push(`(V(${n}) - V(${other}))/${c.value}`);

        if (other !== GND && known[other] !== undefined) {
          sum += G * known[other];
        }
      }
    });

    if (sumG === 0) {
      return { error: `Nó ${n} isolado` };
    }

    steps.push(`KCL em ${n}: ${eq.join(" + ")} = 0`);

    const Vn = sum / sumG;

    if (!Number.isFinite(Vn)) return { error: "Falha numérica" }; // CORREÇÃO

    steps.push(`V(${n}) = ${Vn.toFixed(2)}V`);

    return {
      nodes: { ...known, [n]: Vn },
      steps
    };
  }

  // =============================
  // SISTEMA LINEAR (até 2 nós)
  // =============================
  if (unknownNodes.length <= 2) {

    const A = [];
    const b = [];

    unknownNodes.forEach((n, i) => {

      let row = new Array(unknownNodes.length).fill(0);
      let rhs = 0;

      components.forEach(c => {

        if (!c || c.type !== "resistor") return;
        if (typeof c.value !== "number" || !Number.isFinite(c.value) || c.value === 0) return; // CORREÇÃO

        if (c.n1 === n || c.n2 === n) {

          const other = c.n1 === n ? c.n2 : c.n1;
          const G = 1 / c.value;

          row[i] += G;

          if (other !== GND) {
            if (known[other] !== undefined) {
              rhs += G * known[other];
            } else {
              const j = unknownNodes.indexOf(other);
              if (j !== -1) row[j] -= G;
            }
          }
        }
      });

      A.push(row);
      b.push(rhs);

      steps.push(`Equação nó ${n}: ${JSON.stringify(row)} = ${Number.isFinite(rhs) ? rhs.toFixed(2) : "NaN"}`); // CORREÇÃO
    });

    let solution;

    if (unknownNodes.length === 1) {
      if (!Number.isFinite(A[0][0]) || A[0][0] === 0) return { error: "Sistema inválido" }; // CORREÇÃO
      solution = [b[0] / A[0][0]];
    } else {

      const [[a, b1], [c, d]] = A;
      const [e, f] = b;

      const det = a * d - b1 * c;

      if (!Number.isFinite(det) || det === 0) {
        return { error: "Sistema sem solução única" };
      }

      const x = (e * d - b1 * f) / det;
      const y = (a * f - e * c) / det;

      if (!Number.isFinite(x) || !Number.isFinite(y)) { // CORREÇÃO
        return { error: "Falha numérica" };
      }

      solution = [x, y];
    }

    const resultNodes = { ...known };

    unknownNodes.forEach((n, i) => {
      const val = solution[i];
      resultNodes[n] = Number.isFinite(val) ? val : 0; // CORREÇÃO
      steps.push(`V(${n}) = ${Number.isFinite(val) ? val.toFixed(2) : "NaN"}V`); // CORREÇÃO
    });

    return {
      nodes: resultNodes,
      steps
    };
  }

  // =============================
  // LIMITE
  // =============================
  return {
    error: "Máximo suportado: 2 nós desconhecidos"
  };
}

// =============================
// EXERCÍCIOS
// =============================
export function generateExercise(difficulty = 1) {

  if (difficulty === 1) {
    return {
      question: "Calcule: 10Ω + 20Ω",
      value: 30,
      display: "30Ω",
      meta: {
        type: "series",
        values: [10, 20]
      },
      steps: ["Somar resistores"]
    };
  }

  if (difficulty === 2) {
    return {
      question: "Calcule Req (paralelo): 10Ω e 20Ω",
      value: 6.67,
      display: "6.67Ω",
      meta: {
        type: "parallel",
        values: [10, 20]
      },
      steps: [
        "1/R = 1/10 + 1/20",
        "Somar",
        "Inverter"
      ]
    };
  }

  if (difficulty === 3) {
    return {
      question: "Circuito misto (série + paralelo)",
      value: 15,
      display: "15Ω",
      meta: {
        type: "mixed"
      },
      steps: [
        "Resolver paralelo",
        "Somar com série"
      ]
    };
  }

  return null;
}

import { solveNodal, solveMesh, compareMethods } from "./circuitSolver.js";

export function generateCircuitExercise() {

  const circuit = [
    { type: "source", value: 10, n1: "n1", n2: "gnd" },
    { type: "resistor", value: 10, n1: "n1", n2: "n2" },
    { type: "resistor", value: 20, n1: "n2", n2: "gnd" }
  ];

  const nodal = solveNodal(circuit);
  const mesh = solveMesh(circuit);
  const check = compareMethods(nodal, mesh);

  if (!nodal || nodal.error || !nodal.nodes || !Number.isFinite(nodal.nodes["n2"])) { // CORREÇÃO
    return { error: "Falha ao gerar exercício" };
  }

  const value = nodal.nodes["n2"];

  return {
    question: "Calcule a tensão no nó n2",
    value,
    display: Number.isFinite(value) ? value.toFixed(2) + "V" : "NaN", // CORREÇÃO
    steps: nodal.steps || [],
    meta: {
      type: "nodal",
      circuit,
      validation: check || null
    }
  };
}