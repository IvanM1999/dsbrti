function rand(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const Exercises = [
   
   {
      type: "ohm",
      level: "easy",
      
      generate() {
         
         const V = rand(10, 20);
         const R = rand(1, 10);
         
         return {
            question: `Calcule a corrente (I) para V=${V}V e R=${R}Ω`,
            data: { V, R },
            
            solve: (engine) => engine.ohm({ V, R }),
            
            formula: "I = V / R",
            
            explain: `Aplicando a Lei de Ohm: I = ${V} / ${R}`
         };
      }
   },
   
   {
      type: "series",
      level: "easy",
      
      generate() {
         
         const count = rand(2, 4);
         const values = Array.from({ length: count }, () => rand(1, 10));
         
         return {
            question: `Resistência equivalente em série: ${values.join(" + ")} Ω`,
            data: values,
            
            solve: (engine) => engine.series(values),
            
            formula: "Req = R1 + R2 + ...",
            
            explain: `Somando resistores: ${values.join(" + ")}`
         };
      }
   },
   
   // NOVO: paralelo
   {
      type: "parallel",
      level: "medium",
      
      generate() {
         
         const values = [rand(2, 10), rand(2, 10)];
         
         return {
            question: `Resistência equivalente em paralelo: ${values.join(" || ")} Ω`,
            data: values,
            
            solve: (engine) => engine.parallel(values),
            
            formula: "1/Req = 1/R1 + 1/R2",
            
            explain: `1/Req = 1/${values[0]} + 1/${values[1]}`
         };
      }
   }
   
];

export function getAdaptiveExercise(Progress, Exercises) {

  const acc = parseFloat(Progress.accuracy());

  let pool;

  if (acc < 40) {
    pool = Exercises.filter(e => e.level === "easy");
  } else if (acc < 70) {
    pool = Exercises.filter(e => e.level !== "hard");
  } else {
    pool = Exercises;
  }

  // fallback (segurança)
  if (!pool.length) pool = Exercises;

  const ex = pool[Math.floor(Math.random() * pool.length)];

  return ex.generate();
}

export function getAdaptiveExercise(Progress, Exercises) {

  const p = Progress.load();

  // encontra pior tópico
  let weakest = null;
  let worstAcc = 101;

  for (let t in p.topics) {
    const acc = (p.topics[t].correct / p.topics[t].total) * 100;

    if (acc < worstAcc) {
      worstAcc = acc;
      weakest = t;
    }
  }

  let pool;

  if (weakest) {
    // foca onde o aluno erra
    pool = Exercises.filter(e => e.type === weakest);
  } else {
    pool = Exercises;
  }

  // fallback
  if (!pool.length) pool = Exercises;

  const ex = pool[Math.floor(Math.random() * pool.length)];

  return ex.generate();
}