const canvas = document.getElementById('micrometerCanvas');
const ctx = canvas.getContext('2d');
const readout = document.getElementById('readout');
const toggleBtn = document.getElementById('toggleBtn');

let value = 0.00;
let isHidden = false;

let isDragging = false;
let startX = 0;

// --- SISTEMA DE REDIMENSIONAMENTO DINÂMICO DO CANVAS ---
function resizeCanvas() {
   // Mantém a proporção de 760x230 estável independente do dispositivo
   const baseWidth = 760;
   const baseHeight = 230;
   
   canvas.width = baseWidth;
   canvas.height = baseHeight;
   
   draw();
}

// Escuta redimensionamentos normais e rotações físicas de tela
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
   setTimeout(resizeCanvas, 100); // Curto delay para estabilizar o viewport no Mobile
});

function getCanvasX(e) {
   const rect = canvas.getBoundingClientRect();
   const clientX = e.touches ? e.touches[0].clientX : e.clientX;
   return (clientX - rect.left) * (canvas.width / rect.width);
}

// --- EVENTOS MOUSE ---
canvas.addEventListener('mousedown', (e) => {
   isDragging = true;
   startX = getCanvasX(e);
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
   if (!isDragging) return;
   const currentX = getCanvasX(e);
   const deltaX = currentX - startX;
   startX = currentX;
   adjust(deltaX * 0.008);
});

// --- EVENTOS TOUCH (MOBILE) ---
canvas.addEventListener('touchstart', (e) => {
   isDragging = true;
   startX = getCanvasX(e);
}, { passive: true });

window.addEventListener('touchend', () => isDragging = false);

window.addEventListener('touchmove', (e) => {
   if (!isDragging) return;
   const currentX = getCanvasX(e);
   const deltaX = currentX - startX;
   startX = currentX;
   adjust(deltaX * 0.008);
}, { passive: true });

function adjust(amount) {
   value = Math.max(0, Math.min(25, value + amount));
   updateUI();
}

function toggleView() {
   isHidden = !isHidden;
   if (isHidden) {
      readout.innerText = "??.?? mm";
      readout.classList.add('hidden');
      toggleBtn.innerText = "Mostrar Resposta";
   } else {
      readout.classList.remove('hidden');
      toggleBtn.innerText = "Ocultar Resposta";
      updateUI();
   }
}

function updateUI() {
   if (!isHidden) {
      readout.innerText = value.toFixed(2) + " mm";
   }
   draw();
}

function draw() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   
   const CY = 115; // Altura centralizada
   const scalePX = 8.0; // Fator de escala (8px = 1mm)
   
   const anvilFaceX = 110;
   const zeroSleeveX = 320;
   
   // --- 1. ARCO DE METRO SÓLIDO (C-FRAME) ---
   ctx.fillStyle = '#1e293b';
   ctx.strokeStyle = '#0f172a';
   ctx.lineWidth = 4;
   ctx.beginPath();
   
   // Perfil Externo do Arco
   ctx.moveTo(310, CY - 22);
   ctx.lineTo(310, CY + 26);
   ctx.bezierCurveTo(310, CY + 110, 70, CY + 110, 70, CY + 26);
   ctx.lineTo(70, CY - 22);
   ctx.lineTo(90, CY - 22);
   ctx.lineTo(90, CY + 15);
   
   // Perfil Interno
   ctx.bezierCurveTo(90, CY + 80, 290, CY + 80, 290, CY - 22);
   ctx.closePath();
   ctx.fill();
   ctx.stroke();
   
   // Placa Isolante Térmica
   ctx.fillStyle = '#0f172a';
   ctx.beginPath();
   ctx.roundRect(120, CY + 50, 110, 30, 6);
   ctx.fill();
   
   // Identificação Industrial na Placa
   ctx.fillStyle = '#ffffff';
   ctx.font = 'bold 10px Arial';
   ctx.textAlign = 'center';
   ctx.fillText("DESTINY", 175, CY + 62);
   ctx.fillStyle = '#f59e0b';
   ctx.font = 'bold 8px Arial';
   ctx.fillText("0-25mm  0.01mm", 175, CY + 74);
   
   // Batente Fixo Esquerdo (Anvil)
   ctx.fillStyle = '#cbd5e1';
   ctx.fillRect(90, CY - 8, 20, 16);
   ctx.fillStyle = '#475569';
   ctx.fillRect(anvilFaceX - 3, CY - 8, 3, 16);
   
   // --- 2. HASTE MÓVEL (SPINDLE) ---
   const spindleX = anvilFaceX + (value * scalePX);
   ctx.fillStyle = '#e2e8f0';
   ctx.fillRect(spindleX, CY - 8, 250, 16);
   ctx.fillStyle = '#475569';
   ctx.fillRect(spindleX, CY - 8, 3, 16);
   
   // Trava da Haste
   ctx.fillStyle = '#64748b';
   ctx.beginPath();
   ctx.arc(265, CY - 18, 6, 0, Math.PI * 2);
   ctx.fill();
   
   // --- 3. BAINHA FIXA (SLEEVE) ---
   const sleeveX = 305;
   const sleeveW = 235;
   const sleeveH = 44;
   const sleeveY = CY - 22;
   
   ctx.fillStyle = '#f1f5f9';
   ctx.fillRect(sleeveX, sleeveY, sleeveW, sleeveH);
   ctx.strokeStyle = '#475569';
   ctx.lineWidth = 1.5;
   ctx.strokeRect(sleeveX, sleeveY, sleeveW, sleeveH);
   
   // Linha de Fé Horizontal
   ctx.beginPath();
   ctx.moveTo(sleeveX, CY);
   ctx.lineTo(sleeveX + sleeveW, CY);
   ctx.stroke();
   
   // Gravação de Escalas na Bainha Fixa
   ctx.fillStyle = '#000000';
   ctx.font = 'bold 9px Arial';
   ctx.textAlign = 'center';
   
   for (let i = 0; i <= 25; i++) {
      let posX = zeroSleeveX + (i * scalePX);
      
      if (posX < sleeveX + sleeveW) {
         // Milímetros Inteiros (Linhas Superiores)
         ctx.beginPath();
         ctx.moveTo(posX, CY);
         ctx.lineTo(posX, CY - 8);
         ctx.stroke();
         
         if (i % 5 === 0) {
            ctx.fillText(i.toString(), posX, CY - 11);
         }
         
         // Meios Milímetros (Linhas Inferiores)
         if (i < 25) {
            let meioX = posX + (scalePX / 2);
            ctx.beginPath();
            ctx.moveTo(meioX, CY);
            ctx.lineTo(meioX, CY + 6);
            ctx.stroke();
         }
      }
   }
   
   // --- 4. TAMBOR MÓVEL (THIMBLE) ---
   const thimbleLeft = zeroSleeveX + (value * scalePX);
   const bevelW = 15;
   const thimbleW = 130;
   const thimbleH = 56;
   const thimbleY = CY - 28;
   
   // Desenha o Chanfro Cônico do Tambor
   ctx.fillStyle = '#cbd5e1';
   ctx.beginPath();
   ctx.moveTo(thimbleLeft, CY - 22);
   ctx.lineTo(thimbleLeft + bevelW, thimbleY);
   ctx.lineTo(thimbleLeft + bevelW + thimbleW, thimbleY);
   ctx.lineTo(thimbleLeft + bevelW + thimbleW, CY + 28);
   ctx.lineTo(thimbleLeft + bevelW, CY + 28);
   ctx.lineTo(thimbleLeft, CY + 22);
   ctx.closePath();
   ctx.fill();
   
   // Bordas e Contorno Metálico do Tambor
   ctx.strokeStyle = '#000000';
   ctx.lineWidth = 1.5;
   ctx.beginPath();
   ctx.moveTo(thimbleLeft, CY - 22);
   ctx.lineTo(thimbleLeft + bevelW, thimbleY);
   ctx.lineTo(thimbleLeft + bevelW + thimbleW, thimbleY);
   ctx.lineTo(thimbleLeft + bevelW + thimbleW, CY + 28);
   ctx.lineTo(thimbleLeft + bevelW, CY + 28);
   ctx.lineTo(thimbleLeft, CY + 22);
   ctx.closePath();
   ctx.stroke();
   
   // Linha divisória do chanfro
   ctx.beginPath();
   ctx.moveTo(thimbleLeft + bevelW, thimbleY);
   ctx.lineTo(thimbleLeft + bevelW, CY + 28);
   ctx.stroke();
   
   // Recartilhado
   ctx.fillStyle = '#475569';
   ctx.fillRect(thimbleLeft + bevelW + thimbleW - 25, thimbleY + 1, 24, thimbleH - 2);
   
   // Catraca / Fricção Traseira
   ctx.fillStyle = '#94a3b8';
   ctx.fillRect(thimbleLeft + bevelW + thimbleW, CY - 18, 40, 36);
   ctx.strokeStyle = '#000000';
   ctx.strokeRect(thimbleLeft + bevelW + thimbleW, CY - 18, 40, 36);
   
   // --- 5. DIVISÃO CENTESIMAL DO TAMBOR (0 A 50) ---
   ctx.textAlign = 'right';
   ctx.font = 'bold 9px Arial';
   
   const thimbleVal = value % 0.5;
   const rotation = (thimbleVal / 0.5) * 50;
   
   for (let t = -10; t <= 10; t++) {
      let targetDivision = Math.round(rotation) - t;
      let actualDivision = (targetDivision + 50) % 50;
      
      let deltaDiv = t + (rotation % 1);
      let angle = (deltaDiv / 10) * (Math.PI / 3.2);
      
      if (Math.abs(angle) < Math.PI / 2) {
         let posY = CY - 28 * Math.sin(angle);
         
         ctx.strokeStyle = '#000000';
         ctx.lineWidth = 1;
         ctx.beginPath();
         ctx.moveTo(thimbleLeft, posY);
         ctx.lineTo(thimbleLeft + 8, posY);
         ctx.stroke();
         
         if (actualDivision % 5 === 0) {
            ctx.fillStyle = (actualDivision === 0) ? '#dc2626' : '#000000';
            ctx.fillText(actualDivision.toString(), thimbleLeft - 3, posY + 3);
         }
      }
   }
}

// Inicialização de Fábrica
resizeCanvas();
updateUI();