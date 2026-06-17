// =============================
// PARSER DE CIRCUITO (ROBUSTO)
// =============================

export function parseCircuit(text) {
  
  if (!text || typeof text !== "string") {
    console.error("Entrada inválida para parser");
    return [];
  }
  
  const lines = text.split("\n");
  const components = [];
  
  for (let rawLine of lines) {
    
    const line = rawLine.trim();
    
    if (!line) continue; // ignora linha vazia
    
    const tokens = line.split(/\s+/); // quebra por múltiplos espaços
    
    const name = tokens[0];
    
    if (!name) continue;
    
    const type = detectType(name);
    
    if (!type) {
      console.warn("Tipo desconhecido:", line);
      continue;
    }
    
    const props = parseProps(tokens.slice(1));
    
    if (!props.value || isNaN(props.value)) {
      console.warn("Valor inválido:", line);
      continue;
    }
    
    if (!props.n1 || !props.n2) {
      console.warn("Nós inválidos:", line);
      continue;
    }
    
    components.push({
      type,
      name,
      value: props.value,
      n1: props.n1,
      n2: props.n2
    });
  }
  
  return components;
}

// -----------------------------
// DETECTA TIPO
// -----------------------------
function detectType(name) {
  if (name.startsWith("R")) return "resistor";
  if (name.startsWith("V")) return "source";
  return null;
}

// -----------------------------
// PARSE DE PROPRIEDADES
// -----------------------------
function parseProps(tokens) {
  
  const props = {};
  
  tokens.forEach(token => {
    
    const [key, val] = token.split("=");
    
    if (!key || !val) return;
    
    if (key === "value") {
      const num = parseFloat(val);
      props.value = isNaN(num) ? null : num;
    }
    
    if (key === "n1") props.n1 = val;
    if (key === "n2") props.n2 = val;
    
  });
  
  return props;
}