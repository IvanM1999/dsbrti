// =============================
// IMPORTS
// =============================
import { EngineMath } from "./enginemath.js";
import { parseCircuit } from "./parser.js";
import { CircuitEngine } from "./circuitEngine.js";

// =============================
// UTIL
// =============================
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeText(str) {
  return str.replace(/\s+/g, " ").trim();
}

// =============================
// FACTORY
// =============================
function createExercise({
  type,
  level,
  question,
  data,
  solve,
  formula,
  explain
}) {
  return {
    type,
    level,
    question,
    data,
    solve,
    formula,
    explain
  };
}

// =============================
// EXERCÍCIOS
// =============================
export const Exercises = [
  
  // -----------------------------
  // OHM
  // -----------------------------
  {
    type: "ohm",
    level: "easy",
    
    generate() {
      
      const V = rand(10, 20);
      const R = rand(2, 10); // evita divisão feia
      
      return createExercise({
        type: "ohm",
        level: "easy",
        
        question: `Lei de Ohm: V=${V}V | R=${R}Ω → I=?`,
        
        data: { V, R },
        
        solve: () => {
          const value = V / R;
          return EngineMath.result(value, value.toFixed(2) + " A");
        },
        
        formula: "I = V / R",
        explain: `I = ${V}/${R}`
      });
    }
  },
  
  // -----------------------------
  // SÉRIE (controlado)
  // -----------------------------
  {
    type: "series",
    level: "easy",
    
    generate() {
      
      const count = rand(2, 3); // 🔒 limita tamanho
      const values = Array.from({ length: count }, () => rand(1, 9));
      
      return createExercise({
        type: "series",
        level: "easy",
        
        question: `Req série: ${values.join(" + ")} Ω`,
        
        data: values,
        
        solve: () => {
          const value = values.reduce((a, b) => a + b, 0);
          return EngineMath.result(value, value.toFixed(2) + " Ω");
        },
        
        formula: "Req = soma",
        explain: values.join(" + ")
      });
    }
  },
  
  // -----------------------------
  // PARALELO (fixo 2 resistores)
  // -----------------------------
  {
    type: "parallel",
    level: "medium",
    
    generate() {
      
      const values = [rand(2, 10), rand(2, 10)];
      
      return createExercise({
        type: "parallel",
        level: "medium",
        
        question: `Req paralelo: ${values[0]} || ${values[1]} Ω`,
        
        data: values,
        
        solve: () => {
          const inv = (1 / values[0]) + (1 / values[1]);
          const value = 1 / inv;
          
          return EngineMath.result(value, value.toFixed(2) + " Ω");
        },
        
        formula: "1/Req = soma inversos",
        explain: `1/${values[0]} + 1/${values[1]}`
      });
    }
  },
  
  // -----------------------------
  // CIRCUIT (AGORA PADRONIZADO)
  // -----------------------------
  {
    type: "circuit",
    level: "medium",
    
    generate() {
      
      const V = rand(10, 20);
      const R1 = rand(2, 10);
      const R2 = rand(2, 10);
      
      const isParallel = Math.random() > 0.5;
      
      const text = isParallel ?
        `V1 value=${V} n1=1 n2=0
           R1 value=${R1} n1=1 n2=0
           R2 value=${R2} n1=1 n2=0` :
        `V1 value=${V} n1=1 n2=0
           R1 value=${R1} n1=1 n2=2
           R2 value=${R2} n1=2 n2=0`;
      
      const components = parseCircuit(text);
      
      return createExercise({
        type: "circuit",
        level: "medium",
        
        question: `Circuito: V=${V}V | R1=${R1}Ω | R2=${R2}Ω → Itotal=?`,
        
        data: { V, R1, R2, isParallel },
        
        solve: () => {
          
          const result = CircuitEngine.current(components);
          
          if (result.error) {
            return EngineMath.result(null, result.error);
          }
          
          return EngineMath.result(
            result.value,
            result.display + " A",
            result.steps
          );
        },
        
        formula: "I = V / Req",
        
        explain: isParallel ?
          "Paralelo → Req → Ohm" :
          "Série → Req → Ohm"
      });
    }
  }
  
];

// =============================
// ADAPTATIVO (REFINADO)
// =============================
export function getAdaptiveExercise(Progress) {
  
  const p = Progress.load();
  const acc = Number(Progress.accuracy());
  
  let pool = Exercises.filter(e => {
    if (acc < 40) return e.level === "easy";
    if (acc < 70) return e.level !== "hard";
    return true;
  });
  
  if (!pool.length) pool = Exercises;
  
  let weakest = null;
  let worstAcc = 101;
  
  for (let t in p.topics || {}) {
    
    const topic = p.topics[t];
    if (!topic || topic.total === 0) continue;
    
    const topicAcc = (topic.correct / topic.total) * 100;
    
    if (topicAcc < worstAcc) {
      worstAcc = topicAcc;
      weakest = t;
    }
  }
  
  if (weakest) {
    
    const focused = pool.filter(e => e.type === weakest);
    
    if (focused.length && Math.random() < 0.7) {
      pool = focused;
    }
  }
  
  const ex = pool[Math.floor(Math.random() * pool.length)];
  
  if (!ex || typeof ex.generate !== "function") {
    console.error("Exercício inválido", ex);
    return null;
  }
  
  return ex.generate();
}