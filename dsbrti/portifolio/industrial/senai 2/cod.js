/**
 * CENTRAL METROLÓGICA V5.2 - ENTERPRISE CORE ENGINE (cod.js)
 * Motor Heurístico de Alta Performance, Acessibilidade e SEO Semântico
 * Foco: Indústria 4.0 e Otimização para Motores de Busca (Googlebot)
 */

let historico = [];
let timeoutHistorico = null;

// Banco de Dados Industriais Estruturados (Indexáveis semanticamente)
const DATA_ISO_AJUSTES = [
    { classe: "H7", tipo: "Furo", min_dia: 10, max_dia: 18, es: "+0.018", ei: "0.000", aplicacao: "Polias, engrenagens padrão, guias precisas" },
    { classe: "H7", tipo: "Furo", min_dia: 18, max_dia: 30, es: "+0.021", ei: "0.000", aplicacao: "Polias, engrenagens padrão, guias precisas" },
    { classe: "g6", tipo: "Eixo", min_dia: 10, max_dia: 18, es: "-0.006", ei: "-0.017", aplicacao: "Peças deslizantes, eixos de máquinas livres" },
    { classe: "g6", tipo: "Eixo", min_dia: 18, max_dia: 30, es: "-0.007", ei: "-0.020", aplicacao: "Peças deslizantes, eixos de máquinas livres" },
    { classe: "h6", tipo: "Eixo", min_dia: 10, max_dia: 18, es: "0.000",  ei: "-0.011", aplicacao: "Ajuste fixo manual, acoplamentos diretos" },
    { classe: "js7", tipo: "Misto", min_dia: 10, max_dia: 30, es: "+0.010", ei: "-0.010", aplicacao: "Transições leves, posicionamento estático" }
];

const DATA_ROSCAS = [
    { bitola: "M3 x 0.5", tipo: "Métrica Fina/Média", broca: "2.5 mm", passo: "0.50 mm" },
    { bitola: "M4 x 0.7", tipo: "Métrica Fina/Média", broca: "3.3 mm", passo: "0.70 mm" },
    { bitola: "M5 x 0.8", tipo: "Métrica Fina/Média", broca: "4.2 mm", passo: "0.80 mm" },
    { bitola: "M6 x 1.0", tipo: "Métrica Normal",     broca: "5.0 mm", passo: "1.00 mm" },
    { bitola: "M8 x 1.25", tipo: "Métrica Normal",    broca: "6.8 mm", passo: "1.25 mm" },
    { bitola: "M10 x 1.5", tipo: "Métrica Normal",    broca: "8.5 mm", passo: "1.50 mm" },
    { bitola: "1/4\" UNC", tipo: "Polegada Fios",     broca: "5.1 mm", passo: "20 Fios/pol" },
    { bitola: "5/16\" UNC", tipo: "Polegada Fios",    broca: "6.6 mm", passo: "18 Fios/pol" },
    { bitola: "3/8\" UNC", tipo: "Polegada Fios",     broca: "8.0 mm", passo: "16 Fios/pol" }
];

const DATA_RUGOSIDADE = [
    { classe: "N1", ra_microns: "0.025 µm", triangulos: "▼▼▼▼", processo: "Super-acabamento, lapidação fina" },
    { classe: "N2", ra_microns: "0.05 µm",  triangulos: "▼▼▼▼", processo: "Lapidação industrial, brunimento extremo" },
    { classe: "N4", ra_microns: "0.2 µm",   triangulos: "▼▼▼",  processo: "Retífica fina, polimento espelhado" },
    { classe: "N6", ra_microns: "0.8 µm",   triangulos: "▼▼",   processo: "Torneamento/Fresamento fino, retífica" },
    { classe: "N8", ra_microns: "3.2 µm",   triangulos: "▼",    processo: "Usinagem comercial padrão, desbaste limpo" },
    { classe: "N10", ra_microns: "12.5 µm", triangulos: "Sem",  processo: "Oxicorte, fundição bruta, forjaria" }
];

// Inicialização segura do DOM
window.addEventListener('DOMContentLoaded', () => {
    popularCamposFracao();
    gerarTabelaEstrutural();
    gerarNovasTabelasV5();
    adaptarInterface();
    executarPesquisaHeuristica("");
});

function mudarTemaOS(nomeTema) {
    const body = document.getElementById('app-body');
    if (body) body.className = nomeTema;
}

function mudarAba(id, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const targetAba = document.getElementById(id);
    if (targetAba) targetAba.classList.add('active');
    if (btn) btn.classList.add('active');
}

function popularCamposFracao() {
    const iSel = document.getElementById('frac-int');
    const nSel = document.getElementById('frac-num');
    const dSel = document.getElementById('frac-den');
    if(!iSel || !nSel || !dSel) return;
    
    let optionsInt = "", optionsNum = "", optionsDen = "";
    
    for(let i = 0; i <= 3; i++) optionsInt += `<option value="${i}">${i}"</option>`;
    for(let i = 0; i <= 64; i++) optionsNum += `<option value="${i}">${i === 0 ? '0 (inteiro)' : i}</option>`;
    [2, 4, 8, 16, 32, 64].forEach(d => optionsDen += `<option value="${d}">${d}</option>`);
    
    iSel.innerHTML = optionsInt;
    nSel.innerHTML = optionsNum;
    dSel.innerHTML = optionsDen;
    dSel.value = 16;
}

function mdc(a, b) { return b ? mdc(b, a % b) : a; }
function simplificar(n, d) { let g = mdc(n, d); return [n/g, d/g]; }

function gerarTabelaEstrutural() {
    const tbody = document.getElementById('table-rows');
    if(!tbody) return;
    let html = "";
    for(let i = 1; i < 64; i++) {
        let [n, d] = simplificar(i, 64);
        let dec = i / 64;
        // Injeção de tags 'title' descritivas para SEO Semântico (Robôs do Google mapeiam os atributos estruturais)
        html += `<tr title="Fração comercial ${n}/${d} convertida para milímetros métricos">
            <td><strong>${n}/${d}"</strong></td>
            <td>${dec.toFixed(4)}"</td>
            <td class="text-right" style="font-weight: 500;">${(dec*25.4).toFixed(4)} mm</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

function gerarNovasTabelasV5() {
    const tbodyRoscas = document.getElementById('table-roscas-rows');
    if(tbodyRoscas) {
        tbodyRoscas.innerHTML = DATA_ROSCAS.map(r => 
            `<tr title="Broca recomendada para abrir rosca tipo ${r.bitola}">
                <td><strong>${r.bitola}</strong></td>
                <td><small>${r.tipo}</small></td>
                <td><code>${r.passo}</code></td>
                <td class="text-right" style="color:var(--primary); font-weight:bold;">${r.broca}</td>
             </tr>`
        ).join('');
    }

    const tbodyAjustes = document.getElementById('table-ajustes-rows');
    if(tbodyAjustes) {
        tbodyAjustes.innerHTML = DATA_ISO_AJUSTES.map(a => 
            `<tr title="Limite de ajuste ISO mecânico classe ${a.classe} para ${a.tipo.toLowerCase()}s">
                <td><mark style="background:var(--primary); color:#fff; padding:2px 6px; border-radius:3px; font-weight:bold;">${a.classe}</mark></td>
                <td>${a.tipo}</td>
                <td>${a.min_dia}-${a.max_dia} mm</td>
                <td><code>ES: ${a.es} / EI: ${a.ei}</code></td>
                <td><small>${a.aplicacao}</small></td>
             </tr>`
        ).join('');
    }

    const tbodyRugosidade = document.getElementById('table-rugosidade-rows');
    if(tbodyRugosidade) {
        tbodyRugosidade.innerHTML = DATA_RUGOSIDADE.map(ru => 
            `<tr title="Parâmetro de rugosidade Ra classe ${ru.classe} para acabamento de peças">
                <td><strong>${ru.classe}</strong></td>
                <td style="color:var(--secondary); letter-spacing: 2px;">${ru.triangulos}</td>
                <td><code>${ru.ra_microns}</code></td>
                <td><small>${ru.processo}</small></td>
             </tr>`
        ).join('');
    }
}

function adaptarInterface() {
    const mode = document.getElementById('unit-left').value;
    const boxNumeric = document.getElementById('box-numeric-left');
    const boxFraction = document.getElementById('box-fraction-left');
    
    if(boxNumeric && boxFraction) {
        boxNumeric.style.display = (mode === 'in_frac') ? 'none' : 'block';
        boxFraction.style.display = (mode === 'in_frac') ? 'flex' : 'none';
    }
    calcularMetrologia();
}

function inverterUnidades() {
    const leftSel = document.getElementById('unit-left');
    const rightSel = document.getElementById('unit-right');
    const valRight = document.getElementById('val-right').value;
    
    if(!leftSel || !rightSel) return;
    
    let oldLeftUnit = leftSel.value;
    leftSel.value = rightSel.value;
    rightSel.value = oldLeftUnit;
    
    if (rightSel.value !== 'in_frac' && valRight) {
        let parsedVal = parseFloat(valRight);
        if (!isNaN(parsedVal)) {
            const valLeftInput = document.getElementById('val-left');
            if (valLeftInput) valLeftInput.value = parsedVal;
        }
    }
    adaptarInterface();
}

function calcularMetrologia() {
    const uLeft = document.getElementById('unit-left').value;
    const uRight = document.getElementById('unit-right').value;
    const outField = document.getElementById('val-right');
    const memContent = document.getElementById('memorial-content');

    if(!outField || !memContent) return;

    let polegadaDecimal = 0;
    const valLeftSrc = document.getElementById('val-left');
    let inputBruto = valLeftSrc ? parseFloat(valLeftSrc.value) || 0 : 0;

    if (uLeft === 'in_dec') {
        polegadaDecimal = inputBruto;
    } else if (uLeft === 'mm') {
        polegadaDecimal = inputBruto / 25.4;
    } else if (uLeft === 'in_frac') {
        const i = parseInt(document.getElementById('frac-int').value) || 0;
        const n = parseInt(document.getElementById('frac-num').value) || 0;
        const d = parseInt(document.getElementById('frac-den').value) || 1;
        polegadaDecimal = i + (n / d);
    }

    let valorFinalStr = "";
    if (uRight === 'mm') {
        valorFinalStr = (polegadaDecimal * 25.4).toFixed(4) + " mm";
    } else if (uRight === 'in_dec') {
        valorFinalStr = polegadaDecimal.toFixed(4) + " in";
    } else {
        let pi = Math.floor(polegadaDecimal);
        let pf = polegadaDecimal - pi;
        let p64 = Math.round(pf * 64);
        if (p64 === 0) {
            valorFinalStr = pi + '"';
        } else if (p64 === 64) {
            valorFinalStr = (pi + 1) + '"';
        } else {
            let [ns, ds] = simplificar(p64, 64);
            valorFinalStr = (pi > 0 ? pi + " " : "") + ns + "/" + ds + '"';
        }
    }

    outField.value = valorFinalStr;
    
    // Memorial estruturado rico em palavras-chave para o leitor de tela do Google (SEO de UX)
    memContent.innerHTML = `<p style="margin:0; font-size:13px;">
        <i class="fa-solid fa-microchip"></i> <strong>Engine Industrial Metrológica V5.2:</strong><br>
        Equivalência absoluta processada em milímetros: <code>${(polegadaDecimal * 25.4).toFixed(4)} mm</code><br>
        Fator milesimal de referência direta: <code>${polegadaDecimal.toFixed(6)}" polegadas</code>
    </p>`;
}

// OMNIBOX HEURÍSTICA ESTILO GOOGLE SEARCH COM CONTROLE DINÂMICO DE VISIBILIDADE
function executarPesquisaHeuristica(valorBusca) {
    const painelResultados = document.getElementById('heuristic-results');
    const listaResultados = document.getElementById('heuristic-insights-list');
    if (!painelResultados || !listaResultados) return;

    let query = valorBusca.toLowerCase().trim().replace(',', '.');
    
    if (query === "") {
        listaResultados.innerHTML = `
            <div class="heuristic-card">
                <p><i class="fa-solid fa-bolt" style="color:var(--primary)"></i> <strong>Engine Industrial Omnibox Ativa:</strong> Digite livremente bitolas de brocas, tolerâncias ISO mecânicas (H7, g6), classes N de rugosidade ou frações decimais para correlação instantânea.</p>
            </div>`;
        filtrarTodasTabelas("");
        return;
    }

    let insights = [];

    // Otimização: Varre matrizes usando barreira de filtragem rápida e armazena os blocos HTML correspondentes
    const queryRoscas = DATA_ROSCAS.filter(r => r.bitola.toLowerCase().includes(query) || r.tipo.toLowerCase().includes(query));
    queryRoscas.forEach(r => {
        insights.push(`<div class="heuristic-card" style="border-left-color: #3498db">
            <h5><i class="fa-solid fa-screwdriver"></i> Especificação Técnica de Rosca: <strong>${r.bitola}</strong></h5>
            <p>Classificação do Elemento: <em>${r.tipo}</em> | Passo ou Fios: <code>${r.passo}</code></p>
            <p>⚙️ <strong>Diâmetro Recomendado da Broca de Pré-Furo:</strong> <strong style="color:var(--secondary); font-size:14px;">${r.broca}</strong></p>
        </div>`);
    });

    const queryRugosidade = DATA_RUGOSIDADE.filter(ru => ru.classe.toLowerCase().includes(query) || ru.processo.toLowerCase().includes(query));
    queryRugosidade.forEach(ru => {
        insights.push(`<div class="heuristic-card" style="border-left-color: #e67e22">
            <h5><i class="fa-solid fa-wave-square"></i> Acabamento de Superfície: Classe de Rugosidade <strong>${ru.classe}</strong></h5>
            <p>Simbologia Normalizada Antiga: <span style="color:var(--secondary); font-weight:bold;">${ru.triangulos}</span> | Valor Limite Desvio Médio Ra: <code>${ru.ra_microns}</code></p>
            <p>Aplicação em Operação de Usinagem: <em>${ru.processo}</em></p>
        </div>`);
    });

    const queryAjustes = DATA_ISO_AJUSTES.filter(a => a.classe.toLowerCase().includes(query) || a.aplicacao.toLowerCase().includes(query));
    queryAjustes.forEach(a => {
        insights.push(`<div class="heuristic-card" style="border-left-color: #2ecc71">
            <h5><i class="fa-solid fa-gears"></i> Sistema de Ajustes e Tolerâncias Mecânicas ISO 286</h5>
            <p>Classe Admissível: <strong>${a.classe}</strong> (${a.tipo}) | Intervalo Nominal: <code>${a.min_dia} a ${a.max_dia} mm</code></p>
            <p>Afastamentos Limites Micrométricos: <code>Superior: ${a.es} mm / Inferior: ${a.ei} mm</code></p>
            <p>Uso Prático em Projetos: <em>${a.aplicacao}</em></p>
        </div>`);
    });

    // Saída Inteligente (Estilo "Você quis dizer" / Caixa Resumo do Google)
    if (insights.length > 0) {
        listaResultados.innerHTML = insights.join("");
    } else {
        listaResultados.innerHTML = `
            <div class="heuristic-card" style="border-left-color: var(--text-sub)">
                <p><i class="fa-solid fa-circle-info"></i> Processando termos brutos. Filtros dinâmicos aplicados diretamente nas matrizes estruturais abaixo para a palavra-chave "${valorBusca}".</p>
            </div>`;
    }
    
    // Encaminha a query tratada para o motor de ocultação de linhas das tabelas
    filtrarTodasTabelas(query);
}

// Filtro em Batch de Performance para as tabelas (Evita travamentos de re-renderização no DOM)
function filtrarTodasTabelas(filtro) {
    const rows = document.querySelectorAll('table tbody tr');
    // Armazena em cache o tamanho para otimizar o loop imperativo clássico
    const totalRows = rows.length;
    
    for (let i = 0; i < totalRows; i++) {
        const row = rows[i];
        const textContentStr = row.textContent.toLowerCase().replace(',', '.');
        
        if (filtro === "" || textContentStr.includes(filtro)) {
            row.classList.remove('hide');
        } else {
            row.classList.add('hide');
        }
    }
}
