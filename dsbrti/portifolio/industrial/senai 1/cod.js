/**
 * CENTRAL METROLÓGICA V4.7 - CORE LOGIC ENGINE (cod.js)
 * Motor Heurístico e Conversores Industriais Expandidos
 */

let historico = [];
let timeoutHistorico = null;

// Base de dados estática simplificada para Ajustes Industriais (ISO 286) - H7/g6 (Exemplo em mm para diâmetros de 10-18mm e 18-30mm)
const BASE_ISO_AJUSTES = {
    "h7": { min_dia: 10, max_dia: 30, es: 0.021, ei: 0.000, desc: "Furo Padrão (Tolerância H7)" },
    "g6": { min_dia: 10, max_dia: 30, es: -0.006, ei: -0.017, desc: "Eixo com Deslizamento Ajustado (g6)" },
    "h6": { min_dia: 10, max_dia: 30, es: 0.000, ei: -0.013, desc: "Eixo Padrão (h6)" },
    "js7": { min_dia: 10, max_dia: 30, es: 0.010, ei: -0.010, desc: "Ajuste Intermediário Simétrico (js7)" }
};

window.onload = function() {
    popularCamposFracao();
    gerarTabelaEstrutural();
    adaptarInterface();
    executarPesquisaHeuristica(""); // Inicializa a barra vazia
};

function mudarTemaOS(nomeTema) {
    const body = document.getElementById('app-body');
    body.className = '';
    body.classList.add(nomeTema);
}

function mudarAba(id, btn) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

function popularCamposFracao() {
    const iSel = document.getElementById('frac-int');
    const nSel = document.getElementById('frac-num');
    const dSel = document.getElementById('frac-den');

    if(!iSel || !nSel || !dSel) return;

    iSel.innerHTML = ""; nSel.innerHTML = ""; dSel.innerHTML = "";
    for(let i=0; i<=3; i++) iSel.innerHTML += `<option value="${i}">${i}"</option>`;
    for(let i=0; i<=64; i++) nSel.innerHTML += `<option value="${i}">${i === 0 ? '0 (inteiro)' : i}</option>`;
    [2, 4, 8, 16, 32, 64].forEach(d => dSel.innerHTML += `<option value="${d}">${d}</option>`);
    dSel.value = 16;
}

function mdc(a, b) { return b ? mdc(b, a % b) : a; }

function simplificar(n, d) {
    let g = mdc(n, d);
    return [n/g, d/g];
}

function gerarTabelaEstrutural() {
    const tbody = document.getElementById('table-rows');
    if(!tbody) return;
    let html = "";
    for(let i = 1; i < 64; i++) {
        let [n, d] = simplificar(i, 64);
        let dec = i / 64;
        html += `<tr><td>${n}/${d}"</td><td class="text-right">${dec.toFixed(4)}"</td><td class="text-right">${(dec*25.4).toFixed(4)} mm</td></tr>`;
    }
    for(let inch = 1; inch <= 3; inch++) {
        html += `<tr class="row-inch"><td>${inch}" (Inteira)</td><td class="text-right">${inch.toFixed(4)}"</td><td class="text-right">${(inch*25.4).toFixed(4)} mm</td></tr>`;
        if(inch < 3) {
            for(let f = 1; f < 16; f++) {
                let [n, d] = simplificar(f, 16);
                let dec = inch + (f / 16);
                html += `<tr><td>${inch} ${n}/${d}"</td><td class="text-right">${dec.toFixed(4)}"</td><td class="text-right">${(dec*25.4).toFixed(4)} mm</td></tr>`;
            }
        }
    }
    tbody.innerHTML = html;
}

function adaptarInterface() {
    const mode = document.getElementById('unit-left').value;
    const numericLeft = document.getElementById('box-numeric-left');
    const fractionLeft = document.getElementById('box-fraction-left');
    
    if(!numericLeft || !fractionLeft) return;

    numericLeft.style.display = (mode === 'in_frac') ? 'none' : 'block';
    fractionLeft.style.display = (mode === 'in_frac') ? 'flex' : 'none';
    calcularMetrologia();
}

function inverterUnidades() {
    const leftSel = document.getElementById('unit-left');
    const rightSel = document.getElementById('unit-right');
    const valRight = document.getElementById('val-right').value;
    
    if(!leftSel || !rightSel) return;

    let oldLeftUnit = leftSel.value;
    let oldRightUnit = rightSel.value;

    leftSel.value = oldRightUnit;
    rightSel.value = oldLeftUnit;
    
    if (oldRightUnit !== 'in_frac') {
        let parsedVal = parseFloat(valRight);
        if (!isNaN(parsedVal)) {
            document.getElementById('val-left').value = parsedVal;
        }
    } else {
        let textoFrac = valRight.replace(/"/g, '').trim(); 
        let partesEspaco = textoFrac.split(' ');
        let inteiro = 0;
        let fracaoStr = "";
        
        if (partesEspaco.length === 2) {
            inteiro = parseInt(partesEspaco[0]) || 0;
            fracaoStr = partesEspaco[1];
        } else if (partesEspaco.length === 1) {
            if (partesEspaco[0].includes('/')) {
                fracaoStr = partesEspaco[0];
            } else {
                inteiro = parseInt(partesEspaco[0]) || 0;
            }
        }
        
        document.getElementById('frac-int').value = inteiro;
        
        if (fracaoStr.includes('/')) {
            let partesBarra = fracaoStr.split('/');
            let num = parseInt(partesBarra[0]) || 0;
            let den = parseInt(partesBarra[1]) || 16;
            
            const dSel = document.getElementById('frac-den');
            if ([2, 4, 8, 16, 32, 64].includes(den)) {
                dSel.value = den;
            } else {
                dSel.value = 64;
            }
            document.getElementById('frac-num').value = num;
        } else {
            document.getElementById('frac-num').value = 0;
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
    let explicacao = "";
    let erroDetectado = false;

    if (uLeft === 'in_dec') {
        let v = parseFloat(document.getElementById('val-left').value);
        if(isNaN(v)) erroDetectado = true;
        else { polegadaDecimal = v; explicacao += `• Entrada definida em <strong>Polegada Milesimal</strong>: <code>${polegadaDecimal.toFixed(4)}"</code>.<br>`; }
    } 
    else if (uLeft === 'mm') {
        let v = parseFloat(document.getElementById('val-left').value);
        if(isNaN(v)) erroDetectado = true;
        else {
            polegadaDecimal = v / 25.4;
            explicacao += `• Entrada definida em <strong>Milímetros</strong>: <code>${v.toFixed(4)} mm</code>.<br>`;
            explicacao += `• <strong>Passo 1:</strong> Divisão pela constante padrão (25.4): <code>${v.toFixed(4)} ÷ 25,4000 = ${polegadaDecimal.toFixed(4)}"</code>.<br>`;
        }
    } 
    else if (uLeft === 'in_frac') {
        const i = parseInt(document.getElementById('frac-int').value) || 0;
        const n = parseInt(document.getElementById('frac-num').value) || 0;
        const d = parseInt(document.getElementById('frac-den').value) || 1;
        polegadaDecimal = i + (n / d);

        explicacao += `• Entrada definida em <strong>Polegada Fracionária</strong>: <code>${i > 0 ? i + ' ' : ''}${n}/${d}"</code>.<br>`;
        explicacao += `• <strong>Passo 1:</strong> Resolução da fração base: <code>${n} ÷ ${d} = ${(n/d).toFixed(4)}"</code>.<br>`;
        if(i > 0) explicacao += `• <strong>Passo 2:</strong> Adição da fração ao corpo inteiro: <code>${i} + ${(n/d).toFixed(4)} = ${polegadaDecimal.toFixed(4)}"</code>.<br>`;
    }

    if(erroDetectado) {
        outField.value = "";
        memContent.innerHTML = "Introduza um valor numérico válido para iniciar a análise.";
        return;
    }

    let valorFinalStr = "";
    
    if (uRight === 'mm') {
        let calculadoMm = polegadaDecimal * 25.4;
        valorFinalStr = calculadoMm.toFixed(4) + " mm";
        if (uLeft !== 'mm') explicacao += `• <strong>Cálculo Métrico Final:</strong> Multiplicação pelo fator absoluto: <code>${polegadaDecimal.toFixed(4)} × 25,4000 = ${calculadoMm.toFixed(4)} mm</code>.<br>`;
    } 
    else if (uRight === 'in_dec') {
        valorFinalStr = polegadaDecimal.toFixed(4) + " in";
        if (uLeft !== 'in_dec') explicacao += `• <strong>Cálculo Decimal Final:</strong> Valor convertido para formato milesimal puro: <code>${valorFinalStr}</code>.<br>`;
    } 
    else if (uRight === 'in_frac') {
        let parteInteira = Math.floor(polegadaDecimal);
        let parteFracionaria = polegadaDecimal - parteInteira;
        let sessentaAvos = Math.round(parteFracionaria * 64);
        
        if (sessentaAvos === 0) { valorFinalStr = parteInteira + '"'; }
        else if (sessentaAvos === 64) { valorFinalStr = (parteInteira + 1) + '"'; }
        else {
            let [nSimp, dSimp] = simplificar(sessentaAvos, 64);
            valorFinalStr = (parteInteira > 0 ? parteInteira + " " : "") + nSimp + "/" + dSimp + '"';
        }

        let valorRealFrac = parteInteira + (sessentaAvos / 64);
        let desvio = (polegadaDecimal - valorRealFrac) * 25.4;

        if (Math.abs(desvio) > 0.0001) {
            explicacao += `<br><i class="fa-solid fa-magnifying-glass-chart"></i> <strong>Análise de Tolerância Comercial:</strong><br>• Fração próxima real: <code>${(valorRealFrac * 25.4).toFixed(4)} mm</code>.<br>• <strong>Desvio/Sobra:</strong> <code>${desvio > 0 ? '+' : ''}${desvio.toFixed(4)} mm</code>.<br>`;
        }
    }

    outField.value = valorFinalStr;
    memContent.innerHTML = explicacao + `<br><strong><i class="fa-solid fa-square-check"></i> Resultado Convertido:</strong> <code>${valorFinalStr}</code>`;

    clearTimeout(timeoutHistorico);
    timeoutHistorico = setTimeout(() => { adicionarAoHistorico(uLeft, polegadaDecimal, valorFinalStr); }, 1500);
}

function adicionarAoHistorico(unidadeOrigem, valorPolegadas, stringDestino) {
    let entradaTexto = "";
    if(unidadeOrigem === 'mm') entradaTexto = (valorPolegadas * 25.4).toFixed(4) + " mm";
    else if(unidadeOrigem === 'in_dec') entradaTexto = valorPolegadas.toFixed(4) + " in";
    else {
        const i = document.getElementById('frac-int').value;
        const n = document.getElementById('frac-num').value;
        const d = document.getElementById('frac-den').value;
        entradaTexto = `${i > 0 ? i + ' ' : ''}${n}/${d}"`;
    }

    if (historico.length > 0 && historico[0].entrada === entradaTexto && historico[0].saida === stringDestino) return;
    historico.unshift({ entrada: entradaTexto, saida: stringDestino });
    if(historico.length > 5) historico.pop();

    const hBox = document.getElementById('history-box');
    if(!hBox) return;
    let hHtml = `<ul class="history-list">`;
    historico.forEach(item => {
        hHtml += `<li class="history-item"><span><i class="fa-solid fa-cloud-arrow-down"></i> ${item.entrada}</span> <span><i class="fa-solid fa-right-long"></i></span> <span><i class="fa-solid fa-cloud-arrow-up"></i> <strong>${item.saida}</strong></span></li>`;
    });
    hHtml += `</ul>`;
    hBox.innerHTML = hHtml;
}

// =========================================================================
// ENGINE DE PESQUISA HEURÍSTICA ESTILO GOOGLE INDUSTRIAL (Novos Recursos v4.7)
// =========================================================================
function executarPesquisaHeuristica(valorBusca) {
    const painelResultados = document.getElementById('heuristic-results');
    const listaResultados = document.getElementById('heuristic-insights-list');
    
    if (!painelResultados || !listaResultados) return;
    
    let query = valorBusca.toLowerCase().trim().replace(',', '.');
    
    // Se a barra estiver vazia, exibe uma mensagem de ajuda padrão do motor
    if (query === "") {
        painelResultados.style.display = "block";
        listaResultados.innerHTML = `
            <div class="heuristic-card full-query-help">
                <p><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary)"></i> <strong>Motor Heurístico Ativo:</strong> Digite livremente dados de oficina para processamento imediato.</p>
                <small>Exemplos aceitos: <code>25.4</code>, <code>3/4</code>, <code>h7</code>, <code>50 nm</code> (Torque), <code>6 bar</code> (Pressão)</small>
            </div>`;
        filtrarTabela(""); // Reseta filtro da tabela padrão
        return;
    }

    let insights = [];

    // 1. Heurística de Tolerância Mecânica (Ex: H7, g6, h6)
    for (let ajuste in BASE_ISO_AJUSTES) {
        if (query.includes(ajuste)) {
            let dados = BASE_ISO_AJUSTES[ajuste];
            insights.push(`
                <div class="heuristic-card data-iso">
                    <h5><i class="fa-solid fa-gears"></i> Ajuste Mecânico ISO Encontrado: Classe ${ajuste.toUpperCase()}</h5>
                    <p><strong>Aplicação:</strong> ${dados.desc}</p>
                    <p><strong>Afastamentos (Diâmetros 10 a 30mm):</strong> Superior: <code>+${dados.es} mm</code> | Inferior: <code>${dados.ei >= 0 ? '+' : ''}${dados.ei} mm</code></p>
                </div>
            `);
        }
    }

    // 2. Heurística de Conversão Rápida de Torque (Unidades Nm <=> Lbf.ft)
    if (query.match(/\d+(\.\d+)?\s*(nm|lbf)/)) {
        let valor, Numerico = parseFloat(query);
        if (!isNaN(valorNumerico)) {
            if (query.includes("nm")) {
                let paraLbf = valorNumerico * 0.73756;
                insights.push(`
                    <div class="heuristic-card data-torque">
                        <h5><i class="fa-solid fa-bolt"></i> Conversor de Torque Instantâneo</h5>
                        <p><code>${valorNumerico} Nm</code> equivalente a aproximadamente <strong>${paraLbf.toFixed(3)} lbf·ft</strong> (Padrão Automotivo/Aero).</p>
                    </div>`);
            } else {
                let paraNm = valorNumerico / 0.73756;
                insights.push(`
                    <div class="heuristic-card data-torque">
                        <h5><i class="fa-solid fa-bolt"></i> Conversor de Torque Instantâneo</h5>
                        <p><code>${valorNumerico} lbf·ft</code> equivalente a aproximadamente <strong>${paraNm.toFixed(3)} Nm</strong>.</p>
                    </div>`);
            }
        }
    }

    // 3. Heurística de Conversão Rápida de Pressão Hidráulica/Pneumática (Bar <=> PSI)
    if (query.match(/\d+(\.\d+)?\s*(bar|psi)/)) {
        let valorNumerico = parseFloat(query);
        if (!isNaN(valorNumerico)) {
            if (query.includes("bar")) {
                let paraPsi = valorNumerico * 14.5038;
                insights.push(`
                    <div class="heuristic-card data-pressure">
                        <h5><i class="fa-solid fa-gauge"></i> Conversor de Pressão Instantâneo</h5>
                        <p><code>${valorNumerico} bar</code> equivale a <strong>${paraPsi.toFixed(2)} PSI</strong> (Linha Pneumática/Vapor).</p>
                    </div>`);
            } else {
                let paraBar = valorNumerico / 14.5038;
                insights.push(`
                    <div class="heuristic-card data-pressure">
                        <h5><i class="fa-solid fa-gauge"></i> Conversor de Pressão Instantâneo</h5>
                        <p><code>${valorNumerico} PSI</code> equivale a <strong>${paraBar.toFixed(3)} bar</strong>.</p>
                    </div>`);
            }
        }
    }

    // Atualiza a View do Motor Heurístico
    if(insights.length > 0) {
        listaResultados.innerHTML = insights.join("");
    } else {
        listaResultados.innerHTML = `
            <div class="heuristic-card no-insight">
                <small><i class="fa-solid fa-circle-info"></i> Processando dados brutos. Exibindo correspondências matemáticas na tabela estrutural abaixo.</small>
            </div>`;
    }

    // Encaminha o termo para filtrar a tabela convencional de polegadas de forma transparente
    filtrarTabela(query);
}

function filtrarTabela(filtro) {
    document.querySelectorAll('#table-rows tr').forEach(row => {
        const txt = row.textContent.toLowerCase().replace(',', '.');
        row.classList.toggle('hide', !txt.includes(filtro));
    });
}
