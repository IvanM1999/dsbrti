// =============================
// CIRCUIT SOLVER (NODAL REAL)
// =============================

export function solveNodal(components) {
  
  if (!Array.isArray(components)) {
    return { error: "Entrada inválida" };
  }
  
  const nodes = {};
  const equations = [];
  const steps = [];
  
  components.forEach(c => {
    if (!c) return;
    if (c.n1 && c.n1 !== "gnd") nodes[c.n1] = 0;
    if (c.n2 && c.n2 !== "gnd") nodes[c.n2] = 0;
  });
  
  const nodeList = Object.keys(nodes);
  
  const source = components.find(c =>
    c &&
    c.type === "source" &&
    typeof c.value === "number" &&
    Number.isFinite(c.value) // CORREÇÃO
  );
  
  if (!source || !source.n1) {
    return { error: "Sem fonte" };
  }
  
  nodes[source.n1] = source.value;
  
  steps.push(`Fonte: V(${source.n1}) = ${source.value}V`);
  
  nodeList.forEach((node) => {
    
    if (node === source.n1) return;
    
    let equation = new Array(nodeList.length).fill(0);
    let b = 0;
    
    components.forEach(c => {
      
      if (!c || c.type !== "resistor") return;
      if (typeof c.value !== "number" || !Number.isFinite(c.value) || c.value === 0) return; // CORREÇÃO
      
      if (c.n1 === node || c.n2 === node) {
        
        const other = c.n1 === node ? c.n2 : c.n1;
        const G = 1 / c.value;
        
        const index = nodeList.indexOf(node);
        if (index === -1) return;
        
        equation[index] += G;
        
        if (other !== "gnd") {
          const j = nodeList.indexOf(other);
          
          if (other === source.n1) {
            b += G * source.value;
          } else if (j !== -1) {
            equation[j] -= G;
          }
        }
      }
      
    });
    
    equations.push({ equation, b, node });
    
    steps.push(`KCL no nó ${node}`);
  });
  
  const A = equations.map(e => e.equation.slice());
  const B = equations.map(e => e.b);
  
  const solution = gaussianElimination(A, B);
  
  if (!Array.isArray(solution)) {
    return { error: "Falha na solução" };
  }
  
  equations.forEach((eq, i) => {
    const val = solution[i];
    nodes[eq.node] = (typeof val === "number" && Number.isFinite(val)) ? val : 0; // CORREÇÃO
  });
  
  return { nodes, steps };
}

// =============================
// COMPARAÇÃO
// =============================
export function compareMethods(nodal, mesh) {
  
  if (!nodal || !mesh || nodal.error || mesh.error) {
    return { valid: false };
  }
  
  const values = nodal.nodes ? Object.values(nodal.nodes) : [];
  if (!values.length) return { valid: false };
  
  const sum = values.reduce((a, b) => a + b, 0);
  const avgVoltage = sum / values.length;
  
  const estimatedCurrent = avgVoltage / 10;
  
  if (typeof mesh.current !== "number" || !Number.isFinite(mesh.current)) { // CORREÇÃO
    return { valid: false };
  }
  
  const diff = Math.abs(estimatedCurrent - mesh.current);
  
  return {
    valid: diff < 0.1,
    diff
  };
}

// =============================
// MALHA (SIMPLIFICADO)
// =============================
export function solveMesh(components) {
  
  if (!Array.isArray(components)) {
    return { error: "Entrada inválida" };
  }
  
  const steps = [];
  
  const resistors = components.filter(c =>
    c &&
    c.type === "resistor" &&
    typeof c.value === "number" &&
    Number.isFinite(c.value) // CORREÇÃO
  );
  
  const source = components.find(c =>
    c &&
    c.type === "source" &&
    typeof c.value === "number" &&
    Number.isFinite(c.value) // CORREÇÃO
  );
  
  if (!source) return { error: "Sem fonte" };
  
  const Rtotal = resistors.reduce((sum, r) => sum + r.value, 0);
  
  if (!Number.isFinite(Rtotal) || Rtotal === 0) return { error: "Resistência total inválida" }; // CORREÇÃO
  
  const current = source.value / Rtotal;
  
  steps.push(`Rtotal = ${Rtotal}`);
  steps.push(`I = V / R = ${source.value} / ${Rtotal}`);
  steps.push(`I = ${Number.isFinite(current) ? current.toFixed(2) : "NaN"} A`); // CORREÇÃO
  
  return {
    current: Number.isFinite(current) ? current : null, // CORREÇÃO
    steps
  };
}

// =============================
// GAUSS
// =============================
function gaussianElimination(A, B) {
  
  const n = A.length;
  if (!n || !Array.isArray(B) || B.length !== n) return null; // CORREÇÃO
  
  for (let i = 0; i < n; i++) {
    
    let max = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[j][i]) > Math.abs(A[max][i])) {
        max = j;
      }
    }
    
    [A[i], A[max]] = [A[max], A[i]];
    [B[i], B[max]] = [B[max], B[i]];
    
    const pivot = A[i][i];
    if (!Number.isFinite(pivot) || pivot === 0) return null; // CORREÇÃO
    
    for (let j = i + 1; j < n; j++) {
      const factor = A[j][i] / pivot;
      
      for (let k = i; k < n; k++) {
        A[j][k] -= factor * A[i][k];
      }
      
      B[j] -= factor * B[i];
    }
  }
  
  const x = new Array(n).fill(0);
  
  for (let i = n - 1; i >= 0; i--) {
    let sum = B[i];
    
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * x[j];
    }
    
    const pivot = A[i][i];
    if (!Number.isFinite(pivot) || pivot === 0) return null; // CORREÇÃO
    
    x[i] = sum / pivot;
  }
  
  return x;
}