// =============================
// NODAL ENGINE (UNIFICADO)
// =============================

export function solveNodalWithSteps(components) {

  const GND = "0";
  const steps = [];

  const nodes = new Set();

  components.forEach(c => {
    if (c.n1 !== GND) nodes.add(c.n1);
    if (c.n2 !== GND) nodes.add(c.n2);
  });

  const source = components.find(c => c.type === "source");

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

      if (c.type !== "resistor") return;

      if (c.n1 === n || c.n2 === n) {

        const other = c.n1 === n ? c.n2 : c.n1;
        const G = 1 / c.value;

        sumG += G;

        eq.push(`(V(${n}) - V(${other}))/${c.value}`);

        if (other === GND) {
          // V = 0
        } else if (known[other] !== undefined) {
          sum += G * known[other];
        }
      }
    });

    if (sumG === 0) {
      return { error: `Nó ${n} isolado` };
    }

    steps.push(`KCL em ${n}: ${eq.join(" + ")} = 0`);

    const Vn = sum / sumG;

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

        if (c.type !== "resistor") return;

        if (c.n1 === n || c.n2 === n) {

          const other = c.n1 === n ? c.n2 : c.n1;
          const G = 1 / c.value;

          row[i] += G;

          if (other === GND) {
            // nada
          } else if (known[other] !== undefined) {
            rhs += G * known[other];
          } else {
            const j = unknownNodes.indexOf(other);
            if (j !== -1) {
              row[j] -= G;
            }
          }
        }
      });

      A.push(row);
      b.push(rhs);

      steps.push(`Equação nó ${n}: ${JSON.stringify(row)} = ${rhs.toFixed(2)}`);
    });

    let solution;

    if (unknownNodes.length === 1) {
      solution = [b[0] / A[0][0]];
    } else {

      const [[a, b1], [c, d]] = A;
      const [e, f] = b;

      const det = a * d - b1 * c;

      if (det === 0) {
        return { error: "Sistema sem solução única" };
      }

      const x = (e * d - b1 * f) / det;
      const y = (a * f - e * c) / det;

      solution = [x, y];
    }

    const resultNodes = { ...known };

    unknownNodes.forEach((n, i) => {
      resultNodes[n] = solution[i];
      steps.push(`V(${n}) = ${solution[i].toFixed(2)}V`);
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
}