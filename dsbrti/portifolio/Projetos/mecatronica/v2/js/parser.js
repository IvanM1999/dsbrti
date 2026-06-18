export function parseCircuit(text) {

  const lines = text.split("\n");

  let components = [];

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith("R")) {
      const [name, valuePart, , n1, , n2] = line.split(" ");
      const value = parseFloat(valuePart.split("=")[1]);

      components.push({
        type: "resistor",
        name,
        value,
        n1,
        n2
      });
    }

    if (line.startsWith("V")) {
      const [name, valuePart, , n1, , n2] = line.split(" ");
      const value = parseFloat(valuePart.split("=")[1]);

      components.push({
        type: "source",
        name,
        value,
        n1,
        n2
      });
    }

  });

  return components;
}