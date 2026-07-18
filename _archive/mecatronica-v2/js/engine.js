export function solveNodalWithSteps(components) {
  
  let nodes = {};
  let steps = [];
  
  // coletar nós
  components.forEach(c => {
    if (c.n1 !== "gnd") nodes[c.n1] = null;
    if (c.n2 !== "gnd") nodes[c.n2] = null;
  });
  
  let Vsource = components.find(c => c.type === "source");
  
  if (!Vsource) {
    return { error: "Sem fonte" };
  }
  
  nodes[Vsource.n1] = Vsource.value;
  
  steps.push(`Fonte aplicada: V(${Vsource.n1}) = ${Vsource.value}V`);
  
  // resolver nós
  Object.keys(nodes).forEach(n => {
    
    if (n === Vsource.n1) return;
    
    let eq = "";
    let sumG = 0;
    let sum = 0;
    
    components.forEach(c => {
      
      if (c.type === "resistor" && (c.n1 === n || c.n2 === n)) {
        
        let other = c.n1 === n ? c.n2 : c.n1;
        let G = 1 / c.value;
        
        sumG += G;
        
        eq += `(V(${n}) - V(${other}))/${c.value} + `;
        
        if (other !== "gnd" && nodes[other] !== null) {
          sum += G * nodes[other];
        }
      }
      
    });
    
    eq = eq.slice(0, -3); // remove +
    
    steps.push(`KCL no nó ${n}: ${eq} = 0`);
    
    let voltage = sum / sumG;
    
    steps.push(`Resolvendo: V(${n}) = ${voltage.toFixed(2)}V`);
    
    nodes[n] = voltage;
    
  });
  
  return { nodes, steps };
}