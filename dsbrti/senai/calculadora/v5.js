/* ═══════════════════════════════════════════════════════════════════════════════
   v5.js — Calculadora de Resistores | 3 Sliders Individuais | DSBRti
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─── Variáveis globais ───
let DB = null;
let baseColors = [];
let multColors = [];
let e24Values = [];
let fullCommercialList = [];
let wheels = {};
let dbLoaded = false;

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 CARREGAR DB.JSON
// ═══════════════════════════════════════════════════════════════════════════════
async function loadDatabase() {
    try {
        const resp = await fetch('db.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        DB = await resp.json();

        // Extrair arrays do DB
        const tabela4 = DB.tabela_cores_4_faixas;

        baseColors = tabela4.faixa_1_e_2.map(item => ({
            name:  item.cor,
            color: item.codigo_html,
            text:  item.texto,
            digit: item.digito,
            label: String(item.digito)
        }));

        multColors = tabela4.faixa_3_multiplicador.map(item => ({
            name:  item.cor,
            color: item.codigo_html,
            text:  item.texto,
            mult:  item.multiplicador,
            label: item.rotulo
        }));

        e24Values = DB.series_e24.valores_base;
        fullCommercialList = buildCommercialDatabase();

        dbLoaded = true;
        console.log(`✅ v5 · DB carregado: ${fullCommercialList.length} valores E24, ${baseColors.length} cores, ${multColors.length} multiplicadores`);
        return true;
    } catch (err) {
        console.error('❌ v5 · Erro ao carregar db.json:', err);
        // Fallback
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
            { name: "Preto",   color: "#000000", text: "#FFF", mult: 1,        label: "1 Ω"    },
            { name: "Marrom",  color: "#8B4513", text: "#FFF", mult: 10,       label: "10 Ω"   },
            { name: "Vermelho",color: "#FF0000", text: "#FFF", mult: 100,      label: "100 Ω"  },
            { name: "Laranja", color: "#FFA500", text: "#000", mult: 1000,     label: "1 kΩ"   },
            { name: "Amarelo", color: "#FFFF00", text: "#000", mult: 10000,    label: "10 kΩ"  },
            { name: "Verde",   color: "#008000", text: "#FFF", mult: 100000,   label: "100 kΩ" },
            { name: "Azul",    color: "#0000FF", text: "#FFF", mult: 1000000,  label: "1 MΩ"   }
        ];
        e24Values = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91];
        fullCommercialList = buildCommercialDatabase();
        dbLoaded = true;
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏗️  CONSTRUIR LISTA COMERCIAL
// ═══════════════════════════════════════════════════════════════════════════════
function buildCommercialDatabase() {
    const values = [];
    const multipliers = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
    multipliers.forEach(m => {
        e24Values.forEach(base => values.push(base * m));
    });
    return values;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧭 ROTEADOR SPA
// ═══════════════════════════════════════════════════════════════════════════════
function switchView(viewId) {
    document.querySelectorAll('.spa-view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active-view');
    });

    const target = document.getElementById(viewId);
    if (target) {
        target.style.display = 'flex';
        setTimeout(() => target.classList.add('active-view'), 10);
    }

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (viewId === 'calc-view')       document.getElementById('btn-calc').classList.add('active');
    if (viewId === 'parallel-view')   document.getElementById('btn-parallel').classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 RENDER DISCO SVG
// ═══════════════════════════════════════════════════════════════════════════════
function renderDiskSVG(wheel, textOffset) {
    if (!wheel.dom) return;
    wheel.dom.innerHTML = '';
    const step = 360 / wheel.total;

    wheel.data.forEach((item, i) => {
        const start = i * step;
        const end = (i + 1) * step;

        const r1 = ((start - 90) * Math.PI) / 180;
        const r2 = ((end - 90) * Math.PI) / 180;

        const large = (end - start) > 180 ? 1 : 0;

        const x1 = 50 + 50 * Math.cos(r1);
        const y1 = 50 + 50 * Math.sin(r1);
        const x2 = 50 + 50 * Math.cos(r2);
        const y2 = 50 + 50 * Math.sin(r2);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M50,50 L${x1},${y1} A50,50 0 ${large},1 ${x2},${y2} Z`);
        path.setAttribute('fill', item.color);
        path.setAttribute('class', 'wheel-segment');
        wheel.dom.appendChild(path);

        if (item.label) {
            const midAngle = (start + end) / 2;
            const midRad = ((midAngle - 90) * Math.PI) / 180;
            const offsetPx = textOffset;
            const tx = 50 + offsetPx * Math.cos(midRad);
            const ty = 50 + offsetPx * Math.sin(midRad);

            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', tx);
            txt.setAttribute('y', ty);
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('dominant-baseline', 'central');
            txt.setAttribute('fill', item.text || '#fff');
            txt.setAttribute('font-size', '5');
            txt.setAttribute('font-weight', '700');
            txt.setAttribute('class', 'wheel-label');
            txt.setAttribute('transform', `rotate(${midAngle + 90}, ${tx}, ${ty})`);
            txt.textContent = item.label;
            wheel.dom.appendChild(txt);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🖱️  SISTEMA DE INTERAÇÃO — 3 SLIDERS INDIVIDUAIS
// ═══════════════════════════════════════════════════════════════════════════════
function setupInteractionSystems() {
    const sliderW1 = document.getElementById('slider-w1');
    const sliderW2 = document.getElementById('slider-w2');
    const sliderW3 = document.getElementById('slider-w3');
    const workspace = document.getElementById('drag-surface');

    // ─── Slider individual do 1º dígito ───
    if (sliderW1) {
        sliderW1.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            wheels.w1.rotation = val;
            updateSliderLabel('slider-val-w1', val);
            updateSystemEngine();
        });
    }

    // ─── Slider individual do 2º dígito ───
    if (sliderW2) {
        sliderW2.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            wheels.w2.rotation = val;
            updateSliderLabel('slider-val-w2', val);
            updateSystemEngine();
        });
    }

    // ─── Slider individual do multiplicador ───
    if (sliderW3) {
        sliderW3.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            wheels.w3.rotation = val;
            updateSliderLabel('slider-val-w3', val);
            updateSystemEngine();
        });
    }

    // ─── Arrastar discos (mouse + touch) ───
    if (!workspace) return;

    let activeWheel = null;
    let startAngle = 0;
    let startRotation = 0;

    function getClickAngle(e) {
        const rect = workspace.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.type && e.type.startsWith('touch')
            ? (e.touches ? e.touches[0].clientX : e.changedTouches[0].clientX)
            : e.clientX;
        const clientY = e.type && e.type.startsWith('touch')
            ? (e.touches ? e.touches[0].clientY : e.changedTouches[0].clientY)
            : e.clientY;
        const rad = Math.atan2(clientY - centerY, clientX - centerX);
        let angle = rad * (180 / Math.PI);
        return angle < 0 ? angle + 360 : angle;
    }

    function handleStart(e) {
        e.preventDefault();
        const angle = getClickAngle(e);
        if (angle === undefined) return;

        // Determinar qual wheel está mais perto do clique
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);

        if (!x || !y) return;

        const wheelsArr = ['w1', 'w2', 'w3'];
        let minDist = Infinity;
        let closest = null;

        wheelsArr.forEach(key => {
            const dom = wheels[key].dom;
            if (!dom) return;
            const rect = dom.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.hypot(x - cx, y - cy);
            if (dist < minDist) {
                minDist = dist;
                closest = key;
            }
        });

        if (closest && minDist < 150) {
            activeWheel = closest;
            startAngle = getClickAngle(e);
            startRotation = wheels[activeWheel].rotation;
        }
    }

    function handleMove(e) {
        if (!activeWheel) return;
        e.preventDefault();

        const currentAngle = getClickAngle(e);
        if (currentAngle === undefined) return;

        let delta = currentAngle - startAngle;
        // Ajustar wrap-around
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        wheels[activeWheel].rotation = ((startRotation - delta) % 360 + 360) % 360;

        // Sincronizar slider correspondente
        const sliderMap = { w1: 'slider-w1', w2: 'slider-w2', w3: 'slider-w3' };
        const valMap  = { w1: 'slider-val-w1', w2: 'slider-val-w2', w3: 'slider-val-w3' };
        const slider = document.getElementById(sliderMap[activeWheel]);
        const valEl  = document.getElementById(valMap[activeWheel]);
        if (slider) {
            slider.value = Math.round(wheels[activeWheel].rotation);
        }
        if (valEl) {
            valEl.textContent = Math.round(wheels[activeWheel].rotation);
        }

        updateSystemEngine();
    }

    function handleEnd() {
        activeWheel = null;
    }

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
    if (!wheels.w1 || !dbLoaded) return;

    const idx1 = getActiveIndex(wheels.w1.rotation, wheels.w1.total);
    const idx2 = getActiveIndex(wheels.w2.rotation, wheels.w2.total);
    const idxM = getActiveIndex(wheels.w3.rotation, wheels.w3.total);

    // Aplicar rotação nos discos SVG
    applyRotationDOM(wheels.w1, idx1);
    applyRotationDOM(wheels.w2, idx2);
    applyRotationDOM(wheels.w3, idxM);

    const d1 = wheels.w1.data[idx1];
    const d2 = wheels.w2.data[idx2];
    const m  = wheels.w3.data[idxM];

    if (!d1 || !d2 || !m) return;

    // Detalhamento
    document.getElementById('txt-d1').textContent = d1.digit;
    document.getElementById('dot1').style.backgroundColor = d1.color;
    document.getElementById('txt-d2').textContent = d2.digit;
    document.getElementById('dot2').style.backgroundColor = d2.color;
    document.getElementById('txt-m').textContent = m.label || String(m.mult);
    document.getElementById('dot3').style.backgroundColor = m.color;

    // Cálculo
    const rawOhm = (d1.digit * 10 + d2.digit) * m.mult;
    document.getElementById('main-output').textContent = formatEngineeringUnits(rawOhm);

    // Faixas no resistor visual
    document.getElementById('circle-band-1').style.backgroundColor = d1.color;
    document.getElementById('circle-band-2').style.backgroundColor = d2.color;
    document.getElementById('circle-band-3').style.backgroundColor = m.color;

    // Equivalentes comerciais
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
    if (val >= 1e6) return (val / 1e6).toFixed(val % 1e6 === 0 ? 0 : 1) + " MΩ";
    if (val >= 1e3) return (val / 1e3).toFixed(val % 1e3 === 0 ? 0 : 1) + " kΩ";
    return val + " Ω";
}

function updateSliderLabel(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = Math.round(val);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏷️  RENDERIZAR EQUIVALENTES COMERCIAIS
// ═══════════════════════════════════════════════════════════════════════════════
function renderCommercialMatches(val) {
    let sorted = [...fullCommercialList].sort((a, b) => Math.abs(a - val) - Math.abs(b - val));
    let matches = Array.from(new Set(sorted.filter(x => x > 0))).slice(0, 3);

    const container = document.getElementById('commercial-list');
    if (!container) return;
    container.innerHTML = '';
    matches.forEach(m => {
        const el = document.createElement('div');
        el.className = 'comm-pill';
        el.textContent = formatEngineeringUnits(m);
        container.appendChild(el);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ VIEW PARALELA
// ═══════════════════════════════════════════════════════════════════════════════
function initParallelOptions() {
    const selects = ['p1', 'p2', 'p3', 'p4'].map(id => document.getElementById(id));
    const unique = fullCommercialList.filter((v, i) => fullCommercialList.indexOf(v) === i && v > 0);

    selects.forEach(sel => {
        if (!sel) return;
        sel.innerHTML = '';
        const noneOpt = document.createElement('option');
        noneOpt.value = '0';
        noneOpt.textContent = 'Nenhum (∞)';
        sel.appendChild(noneOpt);

        unique.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = formatEngineeringUnits(v);
            sel.appendChild(opt);
        });
    });

    if (selects[0] && selects[1]) {
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
    if (active.length === 0) {
        document.getElementById('parallel-output').textContent = "-- Ω";
        return;
    }

    let invSum = 0;
    active.forEach(r => invSum += (1 / r));
    const req = 1 / invSum;

    document.getElementById('parallel-output').textContent = formatEngineeringUnits(req);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Carregar banco de dados
    await loadDatabase();

    // 2. Inicializar wheels
    wheels = {
        w1: { dom: document.getElementById('wheel1'), total: baseColors.length, data: baseColors, rotation: 0 },
        w2: { dom: document.getElementById('wheel2'), total: baseColors.length, data: baseColors, rotation: 0 },
        w3: { dom: document.getElementById('wheel3'), total: multColors.length,  data: multColors,  rotation: 0 }
    };

    if (wheels.w1.dom && wheels.w2.dom && wheels.w3.dom) {
        // 3. Renderizar discos
        renderDiskSVG(wheels.w1, 42);
        renderDiskSVG(wheels.w2, 38);
        renderDiskSVG(wheels.w3, 33);

        // 4. Iniciar interação (3 sliders + drag)
        setupInteractionSystems();

        // 5. Inicializar view paralela
        initParallelOptions();

        // 6. Primeira atualização
        updateSystemEngine();

        console.log('🎯 v5 · Calculadora de Resistores — Pronta!');
        console.log(`📦 ${fullCommercialList.length} valores E24 comerciais disponíveis.`);
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 EXPORT para debug no console
// ═══════════════════════════════════════════════════════════════════════════════
window.__V5 = {
    getDB:        () => DB,
    baseColors,
    multColors,
    e24Values,
    fullCommercialList,
    wheels,
    formatEngineeringUnits,
    renderCommercialMatches,
    runParallelCalc
};
