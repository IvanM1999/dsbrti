// ═══════════════════════════════════════════════════════════════════════════════
// 🗄️  script.js — Calculadora de Resistores DSBRti
//     Banco de dados carregado dinamicamente de db.json (E24, cores, potências)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Cache global dos dados do db.json ───
let DB = null;

// ─── Arrays dinâmicos (preenchidos após fetch) ───
let baseColors   = [];
let multColors   = [];
let e24Values    = [];
let fullCommercialList = [];

// ─── Tolerância fixa (4 faixas → ouro = ±5%) ───
const TOLERANCIA_PADRAO = "±5%";

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 CARREGAR DB.JSON
// ═══════════════════════════════════════════════════════════════════════════════
async function loadDatabase() {
    try {
        const resp = await fetch('db.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        DB = await resp.json();

        // ─── Extrair arrays do DB ───
        const tabela4 = DB.tabela_cores_4_faixas;

        // baseColors (faixa_1_e_2)
        baseColors = tabela4.faixa_1_e_2.map(item => ({
            name:  item.cor,
            color: item.codigo_html,
            text:  item.texto,
            digit: item.digito,
            label: String(item.digito)
        }));

        // multColors (faixa_3_multiplicador)
        multColors = tabela4.faixa_3_multiplicador.map(item => ({
            name:  item.cor,
            color: item.codigo_html,
            text:  item.texto,
            mult:  item.multiplicador,
            label: item.rotulo
        }));

        // e24Values
        e24Values = DB.series_e24.valores_base;

        // ─── Construir lista comercial completa ───
        fullCommercialList = buildCommercialDatabase();

        console.log(`✅ DB carregado: ${fullCommercialList.length} valores E24, ${baseColors.length} cores, ${multColors.length} multiplicadores`);
        return true;
    } catch (err) {
        console.error('❌ Erro ao carregar db.json:', err);
        // Fallback: valores mínimos para não quebrar a UI
        baseColors = [
            { name: "Preto",   color: "#000000", text: "#FFF", digit: 0, label: "0" },
            { name: "Marrom",  color: "#8B4513", text: "#FFF", digit: 1, label: "1" },
            { name: "Vermelho",color: "#FF0000", text: "#FFF", digit: 2, label: "2" },
            { name: "Laranja", color: "#FFA500", text: "#000", digit: 3, label: "3" },
            { name: "Amarelo", color: "#FFFF00", text: "#000", digit: 4, label: "4" },
            { name: "Verde",   color: "#008000", text: "#FFF", digit: 5, label: "5" },
            { name: "Azul",    color: "#0000FF", text: "#FFF", digit: 6, label: "6" },
            { name: "Violeta", color: "#EE82EE", text: "#000", digit: 7, label: "7" },
            { name: "Cinza",   color: "#808080", text: "#FFF", digit: 8, label: "8" },
            { name: "Branco",  color: "#FFFFFF", text: "#000", digit: 9, label: "9" }
        ];
        multColors = [
            { name: "Preto",   color: "#000000", text: "#FFF", mult: 1,        label: "0"   },
            { name: "Marrom",  color: "#8B4513", text: "#FFF", mult: 10,       label: "1"   },
            { name: "Vermelho",color: "#FF0000", text: "#FFF", mult: 100,      label: "00"  },
            { name: "Laranja", color: "#FFA500", text: "#000", mult: 1000,     label: "K"   },
            { name: "Amarelo", color: "#FFFF00", text: "#000", mult: 10000,    label: "0K"  },
            { name: "Verde",   color: "#008000", text: "#FFF", mult: 100000,   label: "00K" },
            { name: "Azul",    color: "#0000FF", text: "#FFF", mult: 1000000,  label: "M"   }
        ];
        e24Values = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];
        fullCommercialList = buildCommercialDatabase();
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏗️  CONSTRUIR LISTA COMERCIAL (a partir de e24Values)
// ═══════════════════════════════════════════════════════════════════════════════
function buildCommercialDatabase() {
    let database = [];
    let multipliers = [1, 10, 100, 1000, 10000, 100000, 1000000];
    multipliers.forEach(m => {
        e24Values.forEach(base => database.push((base * m) / 10));
    });
    return database;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧭 ROTEADOR SPA
// ═══════════════════════════════════════════════════════════════════════════════
function switchView(viewId) {
    document.querySelectorAll('.spa-view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active-view');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'flex';
        setTimeout(() => targetView.classList.add('active-view'), 10);
    }
    if(viewId === 'calc-view') document.getElementById('btn-calc').classList.add('active');
    if(viewId === 'parallel-view') document.getElementById('btn-parallel').classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️  MOTORES DE ESTADO CORE
// ═══════════════════════════════════════════════════════════════════════════════
let wheels = {};

// ─── Aguarda o DOM e o DB ───
document.addEventListener("DOMContentLoaded", async () => {
    await loadDatabase();

    wheels = {
        w1: { dom: document.getElementById('wheel1'), total: baseColors.length, data: baseColors, rotation: 0 },
        w2: { dom: document.getElementById('wheel2'), total: baseColors.length, data: baseColors, rotation: 0 },
        w3: { dom: document.getElementById('wheel3'), total: multColors.length,  data: multColors,  rotation: 0 }
    };

    if(wheels.w1.dom && wheels.w2.dom && wheels.w3.dom) {
        renderDiskSVG(wheels.w1, 42);
        renderDiskSVG(wheels.w2, 38);
        renderDiskSVG(wheels.w3, 33);
        setupInteractionSystems();
        initParallelOptions();
        updateSystemEngine();

        console.log('🎯 Calculadora de Resistores DSBRti — Pronta!');
        console.log(`📦 ${fullCommercialList.length} valores E24 comerciais disponíveis.`);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 RENDER DISCO SVG
// ═══════════════════════════════════════════════════════════════════════════════
function renderDiskSVG(wheel, textOffset) {
    const step = 360 / wheel.total;
    wheel.data.forEach((item, i) => {
        const start = i * step;
        const end = (i + 1) * step;
        
        const r1 = ((start - 90) * Math.PI) / 180;
        const r2 = ((end - 90) * Math.PI) / 180;
        
        const x1 = 50 + 50 * Math.cos(r1); const y1 = 50 + 50 * Math.sin(r1);
        const x2 = 50 + 50 * Math.cos(r2); const y2 = 50 + 50 * Math.sin(r2);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`);
        path.setAttribute("fill", item.color);
        path.setAttribute("stroke", "#111");
        path.setAttribute("stroke-width", "0.2");
        wheel.dom.appendChild(path);

        const midAngle = start + step / 2;
        const midRad = ((midAngle - 90) * Math.PI) / 180;
        const tx = 50 + textOffset * Math.cos(midRad);
        const ty = 50 + textOffset * Math.sin(midRad);

        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", tx); txt.setAttribute("y", ty);
        txt.setAttribute("fill", item.text); txt.setAttribute("font-size", "4.5");
        txt.setAttribute("text-anchor", "middle"); txt.setAttribute("dominant-baseline", "central");
        txt.setAttribute("transform", `rotate(${midAngle + 90}, ${tx}, ${ty})`);
        txt.textContent = item.label;
        wheel.dom.appendChild(txt);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🖱️  SISTEMA DE INTERAÇÃO (SLIDER + ARRASTAR DISCOS)
// ═══════════════════════════════════════════════════════════════════════════════
function setupInteractionSystems() {
    const slider = document.getElementById('master-slider');
    const workspace = document.getElementById('drag-surface');
    
    let activeWheel = null;
    let startAngle = 0;
    let startRotation = 0;

    // ─── Slider mestre ───
    if (slider) {
        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            wheels.w1.rotation = val;
            wheels.w2.rotation = val;
            wheels.w3.rotation = val;
            updateSystemEngine();
        });
    }

    function getClickAngle(e) {
        const rect = workspace.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
        
        const rad = Math.atan2(clientY - centerY, clientX - centerX);
        let angle = rad * (180 / Math.PI);
        return angle < 0 ? angle + 360 : angle;
    }

    const handleStart = (e) => {
        if (e.target.tagName === 'path' || e.target.tagName === 'text') {
            const svgId = e.target.parentNode.id;
            if (svgId === 'wheel1') activeWheel = wheels.w1;
            if (svgId === 'wheel2') activeWheel = wheels.w2;
            if (svgId === 'wheel3') activeWheel = wheels.w3;
            
            if (activeWheel) {
                e.preventDefault();
                startAngle = getClickAngle(e);
                startRotation = activeWheel.rotation;
            }
        }
    };

    const handleMove = (e) => {
        if (!activeWheel) return;
        if (e.cancelable) e.preventDefault();

        const currentAngle = getClickAngle(e);
        let delta = currentAngle - startAngle;
        
        let targetRot = (startRotation + delta) % 360;
        activeWheel.rotation = targetRot < 0 ? targetRot + 360 : targetRot;

        updateSystemEngine();
    };

    const handleEnd = () => { activeWheel = null; };

    workspace.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    workspace.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 ATUALIZAR MOTOR PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
function updateSystemEngine() {
    if(!wheels.w1) return;

    const idx1 = getActiveIndex(wheels.w1.rotation, wheels.w1.total);
    const idx2 = getActiveIndex(wheels.w2.rotation, wheels.w2.total);
    const idxM = getActiveIndex(wheels.w3.rotation, wheels.w3.total);

    applyRotationDOM(wheels.w1, idx1);
    applyRotationDOM(wheels.w2, idx2);
    applyRotationDOM(wheels.w3, idxM);

    const d1 = wheels.w1.data[idx1];
    const d2 = wheels.w2.data[idx2];
    const m  = wheels.w3.data[idxM];

    // ─── Detalhamento ───
    document.getElementById('txt-d1').textContent = d1.digit;
    document.getElementById('dot1').style.backgroundColor = d1.color;
    document.getElementById('txt-d2').textContent = d2.digit;
    document.getElementById('dot2').style.backgroundColor = d2.color;
    document.getElementById('txt-m').textContent = m.label || String(m.mult);
    document.getElementById('dot3').style.backgroundColor = m.color;

    // ─── Cálculo ───
    const rawOhm = (d1.digit * 10 + d2.digit) * m.mult;
    document.getElementById('main-output').textContent = formatEngineeringUnits(rawOhm);

    // ─── Faixas no resistor visual ───
    document.getElementById('circle-band-1').style.backgroundColor = d1.color;
    document.getElementById('circle-band-2').style.backgroundColor = d2.color;
    document.getElementById('circle-band-3').style.backgroundColor = m.color;

    // ─── Equivalentes comerciais ───
    renderCommercialMatches(rawOhm);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════
function getActiveIndex(rotationAngle, total) {
    const step = 360 / total;
    let normalized = (360 - rotationAngle - (step / 2)) % 360;
    if (normalized < 0) normalized += 360;
    return Math.floor(normalized / step) % total;
}

function applyRotationDOM(wheel, index) {
    const step = 360 / wheel.total;
    wheel.dom.style.transform = `translate(-50%, -50%) rotate(${-(index * step)}deg)`;
}

function formatEngineeringUnits(val) {
    if(val >= 1e6) return (val / 1e6).toFixed(val % 1e6 === 0 ? 0 : 1) + " MΩ";
    if(val >= 1e3) return (val / 1e3).toFixed(val % 1e3 === 0 ? 0 : 1) + " kΩ";
    return val + " Ω";
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏷️  RENDERIZAR EQUIVALENTES COMERCIAIS (db.json → E24)
// ═══════════════════════════════════════════════════════════════════════════════
function renderCommercialMatches(val) {
    let sorted = [...fullCommercialList].sort((a,b) => Math.abs(a - val) - Math.abs(b - val));
    let matches = Array.from(new Set(sorted.filter(x => x > 0))).slice(0, 3);

    const container = document.getElementById('commercial-list');
    container.innerHTML = '';
    matches.forEach(m => {
        const el = document.createElement('div');
        el.className = 'comm-pill';
        el.textContent = formatEngineeringUnits(m);
        container.appendChild(el);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ VIEW PARALELA — Inicializar selects com dados do db.json
// ═══════════════════════════════════════════════════════════════════════════════
function initParallelOptions() {
    const selects = ['p1', 'p2', 'p3', 'p4'].map(id => document.getElementById(id));
    const uniqueCommercials = fullCommercialList.filter((v, i) => fullCommercialList.indexOf(v) === i && v > 0);
    
    selects.forEach(sel => {
        if(sel) {
            sel.options.add(new Option("Nenhum (∞)", 0));
            uniqueCommercials.forEach(v => {
                sel.options.add(new Option(formatEngineeringUnits(v), v));
            });
        }
    });
    if(selects[0] && selects[1]) {
        selects[0].selectedIndex = 1;
        selects[1].selectedIndex = 1;
    }
    runParallelCalc();
}

function runParallelCalc() {
    const v1 = parseFloat(document.getElementById('p1').value || 0);
    const v2 = parseFloat(document.getElementById('p2').value || 0);
    const v3 = parseFloat(document.getElementById('p3').value || 0);
    const v4 = parseFloat(document.getElementById('p4').value || 0);

    const active = [v1, v2, v3, v4].filter(x => x > 0);
    if(active.length === 0) {
        document.getElementById('parallel-output').textContent = "-- Ω";
        return;
    }

    let invSum = 0;
    active.forEach(r => invSum += (1 / r));
    const req = 1 / invSum;

    document.getElementById('parallel-output').textContent = formatEngineeringUnits(req);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 EXPORT (para debug via console)
// ═══════════════════════════════════════════════════════════════════════════════
window.__DB = {
    getDB:        () => DB,
    baseColors,
    multColors,
    e24Values,
    fullCommercialList,
    formatEngineeringUnits,
    renderCommercialMatches
};
