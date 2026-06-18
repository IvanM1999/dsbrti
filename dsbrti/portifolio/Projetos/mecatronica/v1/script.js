let correctAnswer = 0;
let formula = "";
let resolution = "";

function newExercise() {
   document.getElementById("feedback").innerHTML = "";
   document.getElementById("answer").value = "";
   
   const type = Math.floor(Math.random() * 6);
   
   // OHM
   if (type === 0) {
      let V = rand(10, 30);
      let R = rand(1, 10);
      
      correctAnswer = V / R;
      formula = "I = V / R";
      resolution = `I = ${V}/${R} = ${correctAnswer.toFixed(2)} A`;
      
      setQ(`Calcule a corrente: V=${V}V, R=${R}Ω`);
   }
   
   // SÉRIE
   else if (type === 1) {
      let R1 = rand(1, 10);
      let R2 = rand(1, 10);
      
      correctAnswer = R1 + R2;
      formula = "Req = R1 + R2";
      resolution = `${R1} + ${R2} = ${correctAnswer}Ω`;
      
      setQ(`Resistores em série: ${R1}Ω e ${R2}Ω`);
   }
   
   // PARALELO
   else if (type === 2) {
      let R1 = rand(2, 10);
      let R2 = rand(2, 10);
      
      correctAnswer = 1 / (1 / R1 + 1 / R2);
      formula = "1/Req = 1/R1 + 1/R2";
      resolution = `Req = ${correctAnswer.toFixed(2)}Ω`;
      
      setQ(`Resistores em paralelo: ${R1}Ω e ${R2}Ω`);
   }
   
   // POTÊNCIA
   else if (type === 3) {
      let V = rand(10, 30);
      let I = rand(1, 5);
      
      correctAnswer = V * I;
      formula = "P = V × I";
      resolution = `${V} × ${I} = ${correctAnswer}W`;
      
      setQ(`Calcule a potência: V=${V}V, I=${I}A`);
   }
   
   // DIVISOR DE TENSÃO
   else if (type === 4) {
      let V = rand(10, 30);
      let R1 = rand(1, 10);
      let R2 = rand(1, 10);
      let Req = R1 + R2;
      
      correctAnswer = V * (R1 / Req);
      formula = "V = Vtotal × (R / Req)";
      resolution = `${V} × (${R1}/${Req}) = ${correctAnswer.toFixed(2)}V`;
      
      setQ(`Divisor: tensão em R1 (${R1}Ω e ${R2}Ω, V=${V}V)`);
   }
   
   // KIRCHHOFF (simples)
   else {
      let I1 = rand(2, 10);
      let I2 = rand(1, I1 - 1);
      
      correctAnswer = I1 - I2;
      formula = "I1 = I2 + I3";
      resolution = `${I1} - ${I2} = ${correctAnswer}A`;
      
      setQ(`KCL: corrente restante? I1=${I1}A, I2=${I2}A`);
   }
}

function checkAnswer() {
   let user = parseFloat(document.getElementById("answer").value);
   if (isNaN(user)) return;
   
   if (Math.abs(user - correctAnswer) < 0.1) {
      feedback("✔ Correto!", "correct");
   } else {
      feedback(`✖ Errado<br><b>${formula}</b><br>${resolution}`, "wrong");
   }
}

function showAnswer() {
   feedback(`Resposta: ${correctAnswer.toFixed(2)}<br>${resolution}`);
}

function setQ(text) {
   document.getElementById("question").innerText = text;
}

function feedback(text, cls = "") {
   document.getElementById("feedback").innerHTML =
      `<span class="${cls}">${text}</span>`;
}

function rand(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}