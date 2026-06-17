/**
 * ENGINE DE PROCESSAMENTO MATEMÁTICO INDUSTRIAL (calculadoras.js)
 * Motores dedicados de conversão de metrologia, rugosidade e torque.
 */
let logHistoricoMetrologia = []; // Mantido alinhado com o escopo global

const engineCalculos = {
    // --- GERENCIADOR DE INTERFACE DO CONVERSOR DE POLEGADAS ---
    atualizarCamposConversor() {
        const origem = document.getElementById('calc-conv-origem').value;
        const painelDireto = document.getElementById('wrapper-input-direto');
        const painelFracao = document.getElementById('wrapper-input-fracionaria');
        
        if (origem === 'in_frac') {
            painelDireto.classList.add('hide');
            painelFracao.classList.remove('hide');
        } else {
            painelDireto.classList.remove('hide');
            painelFracao.classList.add('hide');
        }
    },

    // --- CONVERSOR 1: METROLOGIA BIDIRECIONAL MESTRE ---
    executarConversaoMestre() {
        const origem = document.getElementById('calc-conv-origem').value;
        const destino = document.getElementById('calc-conv-destino').value;
        const display = document.getElementById('res-calc-conversor');
        let valorPolegadaDecimal = 0;
        let strOrigem = "";

        // Fase 1: Identificar e normalizar entrada para Polegada Decimal
        if (origem === 'mm') {
            const mm = parseFloat(document.getElementById('calc-conv-valor').value) || 0;
            valorPolegadaDecimal = mm / 25.4;
            strOrigem = mm.toFixed(3) + " mm";
        } else if (origem === 'in_dec') {
            const dec = parseFloat(document.getElementById('calc-conv-valor').value) || 0;
            valorPolegadaDecimal = dec;
            strOrigem = dec.toFixed(4) + '"';
        } else if (origem === 'in_frac') {
            const i = parseInt(document.getElementById('calc-frac-int').value) || 0;
            const n = parseInt(document.getElementById('calc-frac-num').value) || 0;
            const d = parseInt(document.getElementById('calc-frac-den').value) || 1;
            valorPolegadaDecimal = i + (n / d);
            strOrigem = `${i > 0 ? i + ' ' : ''}${n}/${d}"`;
        }

        // Fase 2: Transmudar para a unidade de destino selecionada
        let strSaida = "";
        if (destino === 'mm') {
            strSaida = (valorPolegadaDecimal * 25.4).toFixed(4) + " mm";
        } else if (destino === 'in_dec') {
            strSaida = valorPolegadaDecimal.toFixed(4) + '" (Decimal)';
        } else if (destino === 'in_frac') {
            strSaida = this.decimalParaFracao(valorPolegadaDecimal);
        }

        // Renderiza o resultado e salva no histórico
        display.innerHTML = `Resultado: <strong style="color:var(--ubuntu-orange); font-size:15px;">${strSaida}</strong>`;
        this.registrarLog(strOrigem, strSaida);
    },

    decimalParaFracao(dec) {
        const inteiro = Math.floor(dec);
        const residuo = dec - inteiro;
        if (residuo < 0.0039) return inteiro > 0 ? `${inteiro}"` : '0"';
        
        let num = Math.round(residuo * 128);
        let den = 128;
        if (num === 128) return `${inteiro + 1}"`;
        
        const mdc = (a, b) => b ? mdc(b, a % b) : a;
        const div = mdc(num, den);
        num /= div; den /= div;
        return `${inteiro > 0 ? inteiro + ' ' : ''}${num}/${den}"`;
    },

    registrarLog(entrada, saida) {
        if (logHistoricoMetrologia.length > 0 && logHistoricoMetrologia[0].in === entrada && logHistoricoMetrologia[0].out === saida) return;
        logHistoricoMetrologia.unshift({ in: entrada, out: saida });
        if (logHistoricoMetrologia.length > 4) logHistoricoMetrologia.pop();
        
        const target = document.getElementById('history-box-target');
        if (target) {
            target.innerHTML = `<ul class="history-list">` + 
                logHistoricoMetrologia.map(item => `
                    <li class="history-item">
                        <span>${item.in}</span>
                        <span> ➔ </span>
                        <span><strong>${item.out}</strong></span>
                    </li>
                `).join('') + `</ul>`;
        }
    },

    // --- MÓDULO: USINAGEM E AJUSTES ISO ---
    calcularUsinagem() {
        const vc = parseFloat(document.getElementById('calc-usin-vc').value) || 0;
        const dc = parseFloat(document.getElementById('calc-usin-dc').value) || 0;
        const fz = parseFloat(document.getElementById('calc-usin-fz').value) || 0;
        const z = parseInt(document.getElementById('calc-usin-z').value) || 1;
        const dest = document.getElementById('res-calc-usinagem');
        if (dc <= 0) { dest.innerHTML = "Diâmetro inválido."; return; }
        
        const rpm = (vc * 1000) / (Math.PI * dc);
        const vf = rpm * fz * z;
        dest.innerHTML = `Rotação: <strong>${Math.round(rpm)} RPM</strong> | Avanço: <strong>${Math.round(vf)} mm/min</strong>`;
    },

    calcularToleranciaISO() {
        const nominal = parseFloat(document.getElementById('calc-iso-nominal').value) || 0;
        const classe = document.getElementById('calc-iso-classe').value;
        const dest = document.getElementById('res-calc-iso');
        let es = 0, ei = 0;
        
        if (nominal >= 10 && nominal <= 30) {
            if (classe === "H7") { es = 0.021; ei = 0.000; }
            else if (classe === "g6") { es = -0.007; ei = -0.020; }
            else if (classe === "h6") { es = 0.000; ei = -0.013; }
            else if (classe === "p6") { es = 0.035; ei = 0.022; }
            dest.innerHTML = `Faixa Limite: <strong>[${(nominal+ei).toFixed(3)} mm a ${(nominal+es).toFixed(3)} mm]</strong><br>ES: ${es > 0 ? '+' : ''}${es.toFixed(3)} | EI: ${ei.toFixed(3)}`;
        } else {
            dest.innerHTML = "Matriz de teste limitada entre diâmetros de 10 a 30mm.";
        }
    },

    // --- MÓDULO: ELETRÔNICA ---
    calcularConversaoSinal() {
        const tipo = document.getElementById('calc-el-tipo').value;
        const lido = parseFloat(document.getElementById('calc-el-lido').value) || 0;
        const min = parseFloat(document.getElementById('calc-el-min').value) || 0;
        const max = parseFloat(document.getElementById('calc-el-max').value) || 0;
        const dest = document.getElementById('res-calc-eletronica');
        let fator = tipo === "4-20" ? (lido - 4) / 16 : lido / 10;
        
        if (fator < 0 || fator > 1) { dest.innerHTML = "<span style='color:var(--warning)'>Aviso: Sinal analógico fora dos limites (Saturação).</span>"; return; }
        const valorProc = min + (fator * (max - min));
        dest.innerHTML = `Grandeza Direta: <strong>${valorProc.toFixed(2)} [Unid.]</strong> em ${(fator * 100).toFixed(1)}% do Span.`;
    },

    calcularDivisorTensao() {
        const vcc = parseFloat(document.getElementById('calc-el-vcc').value) || 0;
        const vout = parseFloat(document.getElementById('calc-el-vout').value) || 0;
        const r2 = parseFloat(document.getElementById('calc-el-r2').value) || 0;
        const dest = document.getElementById('res-calc-divisor');
        
        if (vout >= vcc || vout <= 0) { dest.innerHTML = "Vout deve ser menor que Vcc e maior que zero."; return; }
        const r1 = r2 * (vcc - vout) / vout;
        dest.innerHTML = `Resistor R1 Necessário: <strong>${r1.toFixed(1)} Ω</strong> (Para casar com R2 de ${r2} Ω)`;
    }, // <-- Corrigido o fechamento da função aqui

    // --- MÓDULO: CLP ---
    calcularNormalizacaoCLP() {
        const resMax = parseFloat(document.getElementById('calc-clp-bits').value);
        const bruto = parseFloat(document.getElementById('calc-clp-bruto').value) || 0;
        const pMax = parseFloat(document.getElementById('calc-clp-pmax').value) || 0;
        const dest = document.getElementById('res-calc-clp');
        
        if (bruto > resMax || bruto < 0) { dest.innerHTML = "Valor lido ultrapassa a resolução configurada."; return; }
        const norm = bruto / resMax;
        const scaled = norm * pMax;
        dest.innerHTML = `NORM_X (0.0 a 1.0): <strong>${norm.toFixed(4)}</strong><br>SCALE_X Escalonado: <strong>${scaled.toFixed(2)}</strong>`;
    },

    gerarTemplateSCL() {
        const tipo = document.getElementById('calc-clp-template').value;
        const box = document.getElementById('res-clp-scl');
        if (tipo === "interlock") {
            box.value = `// Intertravamento de Segurança de Motor\nIF "BOTAO_EMERGENCIA" = FALSE OR "PROTECAO_GRADE" = FALSE THEN\n    "SAIDA_CONTATOR_MOTOR" := FALSE;\n    "ALARME_FALHA" := TRUE;\nELSIF "BOTAO_LIGA" = TRUE AND "FALHA_TERMICO" = FALSE THEN\n    "SAIDA_CONTATOR_MOTOR" := TRUE;\nEND_IF;`;
        } else {
            box.value = `// Tratamento Analógico e Monitor de Quebra de Fio (4-20mA)\n"VALOR_NORMALIZADO" := INT_TO_REAL("INPUT_WORD_CH7") / 27648.0;\nIF "INPUT_WORD_CH7" < 3500 THEN // Equivalente a menos de 3.8mA\n    "SENSOR_FALHA_CONEXAO" := TRUE;\n    "VALOR_PROCESSO_REAL" := 0.0; // Força valor seguro\nELSE\n    "SENSOR_FALHA_CONEXAO" := FALSE;\n    "VALOR_PROCESSO_REAL" := "VALOR_NORMALIZADO" * 100.0; // Escala 0-100%\nEND_IF;`;
        }
    },

    // --- MÓDULO: NDT & PROCESSOS ---
    calcularProfundidadeFalha() {
        const v = parseFloat(document.getElementById('calc-us-material').value);
        const tempo = parseFloat(document.getElementById('calc-us-tempo').value) || 0;
        const dest = document.getElementById('res-calc-ultrassom');
        const d = (v * (tempo * 1e-6) / 2) * 1000;
        dest.innerHTML = `Eco de Fundo: Descontinuidade localizada a <strong>${d.toFixed(2)} mm</strong> da face linear do transdutor.`;
    },

    calcularCotaModelo() {
        const cota = parseFloat(document.getElementById('calc-fund-cota').value) || 0;
        const taxa = parseFloat(document.getElementById('calc-fund-taxa').value) || 0;
        const dest = document.getElementById('res-calc-fundicao');
        dest.innerHTML = `Dimensão Linear Compensada para Molde: <strong>${(cota * (1 + (taxa / 100))).toFixed(3)} mm</strong>`;
    }
};
