/**
 * ENGINE DE PROCESSAMENTO MATEMÁTICO INDUSTRIAL (calculadoras.js)
 * Motores dedicados de conversão de metrologia, rugosidade e torque.
 */

let historicoConversoes = [];

const engineCalculos = {
    
    // --- GERENCIADOR DE INTERFACE DO CONVERSOR DE POLEGADAS ---
    alternarCamposPolegada() {
        const origem = document.getElementById('conv-medida-origem').value;
        const painelDireto = document.getElementById('painel-input-direto');
        const painelFracao = document.getElementById('painel-input-fracionaria');

        if (origem === 'in_frac') {
            painelDireto.classList.add('hide');
            painelFracao.classList.remove('hide');
        } else {
            painelDireto.classList.remove('hide');
            painelFracao.classList.add('hide');
        }
    },

    // --- CONVERSOR 1: METROLOGIA BIDIRECIONAL MESTRE ---
    processarConversaoMetrologia() {
        const origem = document.getElementById('conv-medida-origem').value;
        const destino = document.getElementById('conv-medida-destino').value;
        const output = document.getElementById('res-metrologia');

        let polegadaDecimalBase = 0;
        let labelEntrada = "";

        // Fase 1: Identificar e normalizar entrada para Polegada Decimal
        if (origem === 'mm') {
            const mm = parseFloat(document.getElementById('input-valor-direto').value) || 0;
            polegadaDecimalBase = mm / 25.4;
            labelEntrada = mm.toFixed(4) + " mm";
        } 
        else if (origem === 'in_dec') {
            const dec = parseFloat(document.getElementById('input-valor-direto').value) || 0;
            polegadaDecimalBase = dec;
            labelEntrada = dec.toFixed(4) + '"';
        } 
        else if (origem === 'in_frac') {
            const inteiro = parseInt(document.getElementById('frac-inteiro').value) || 0;
            const numerador = parseInt(document.getElementById('frac-numerador').value) || 0;
            const denominador = parseInt(document.getElementById('frac-denominador').value) || 1;

            polegadaDecimalBase = inteiro + (numerador / denominador);
            labelEntrada = `${inteiro > 0 ? inteiro + ' ' : ''}${numerador}/${denominador}"`;
        }

        // Fase 2: Transmudar para a unidade de destino selecionada
        let labelSaida = "";

        if (destino === 'mm') {
            const resultadoMm = polegadaDecimalBase * 25.4;
            labelSaida = resultadoMm.toFixed(4) + " mm";
        } 
        else if (destino === 'in_dec') {
            labelSaida = polegadaDecimalBase.toFixed(4) + '"';
        } 
        else if (destino === 'in_frac') {
            labelSaida = this.traduzirDecimalParaFracaoPolegada(polegadaDecimalBase);
        }

        // Renderização do resultado e salvamento no histórico
        output.innerHTML = `➔ Resultado: <strong style="color:var(--ubuntu-orange); font-size:16px;">${labelSaida}</strong>`;
        this.adicionarAoHistorico(labelEntrada, labelSaida, "Dimensão");
    },

    traduzirDecimalParaFracaoPolegada(valorDecimal) {
        const parteInteira = Math.floor(valorDecimal);
        const residuo = valorDecimal - parteInteira;

        if (residuo < (1 / 128)) {
            return parteInteira > 0 ? `${parteInteira}"` : '0"';
        }

        // Aproximação industrial para base de 128 avos
        let numavos = Math.round(residuo * 128);
        let dendom = 128;

        if (numavos === 128) {
            return `${parteInteira + 1}"`;
        }

        // Simplificação por Máximo Divisor Comum (MDC)
        const calcularMdc = (a, b) => b ? calcularMdc(b, a % b) : a;
        const divisorComum = calcularMdc(numavos, dendom);

        numavos /= divisorComum;
        dendom /= divisorComum;

        return `${parteInteira > 0 ? parteInteira + ' ' : ''}${numavos}/${dendom}"`;
    },

    // --- CONVERSOR 2: RUGOSIDADE SUPERFICIAL (ISO vs Ra) ---
    processarConversaoRugosidade() {
        const tipo = document.getElementById('conv-rug-tipo').value;
        const entrada = document.getElementById('input-rug-valor').value.trim();
        const output = document.getElementById('res-rugosidade');

        // Tabela estática de alta fidelidade baseada na norma ISO 1302
        const tabelaRugosidade = [
            { classe: "N1", um: 0.025, uin: 1 },
            { classe: "N2", um: 0.05, uin: 2 },
            { classe: "N3", um: 0.1, uin: 4 },
            { classe: "N4", um: 0.2, uin: 8 },
            { classe: "N5", um: 0.4, uin: 16 },
            { classe: "N6", um: 0.8, uin: 32 },
            { classe: "N7", um: 1.6, uin: 63 },
            { classe: "N8", um: 3.2, uin: 125 },
            { classe: "N9", um: 6.3, uin: 250 },
            { classe: "N10", um: 12.5, uin: 500 },
            { classe: "N11", um: 25.0, uin: 1000 },
            { classe: "N12", um: 50.0, uin: 2000 }
        ];

        let correspondencia = null;

        if (tipo === 'classe') {
            const busca = entrada.toUpperCase();
            correspondencia = tabelaRugosidade.find(r => r.classe === busca);
        } else if (tipo === 'micrometro') {
            const valUm = parseFloat(entrada) || 0;
            // Encontra a classe mais próxima por limite inferior/superior
            correspondencia = tabelaRugosidade.reduce((prev, curr) => 
                Math.abs(curr.um - valUm) < Math.abs(prev.um - valUm) ? curr : prev
            );
        }

        if (!correspondencia) {
            output.innerHTML = "<span style='color:var(--ubuntu-orange)'>Classe N inválida (Use de N1 a N12).</span>";
            return;
        }

        output.innerHTML = `📊 Classe ISO: <strong>${correspondencia.classe}</strong><br>
                            📐 Métrica: <strong>${correspondencia.um} µm (Ra)</strong><br>
                            🇺🇸 Imperial: <strong>${correspondencia.uin} µin (Ra)</strong>`;
        
        this.adicionarAoHistorico(`${tipo === 'classe' ? entrada.toUpperCase() : entrada + ' µm'}`, `${correspondencia.classe} / ${correspondencia.um}µm`, "Rugosidade");
    },

    // --- CONVERSOR 3: TORQUE E FIXAÇÃO DE MANUTENÇÃO ---
    processarConversaoTorque() {
        const unidadeOrigem = document.getElementById('conv-torque-origem').value;
        const valor = parseFloat(document.getElementById('input-torque-valor').value) || 0;
        const output = document.getElementById('res-torque');

        let nm = 0;

        // Normalização base para Newton-Metro (Nm)
        if (unidadeOrigem === 'nm') nm = valor;
        else if (unidadeOrigem === 'kgfm') nm = valor * 9.80665;
        else if (unidadeOrigem === 'lbfin') nm = valor * 0.11298;

        // Transmuta para as demais unidades simultaneamente
        const kgfm = nm / 9.80665;
        const lbfin = nm / 0.11298;

        output.innerHTML = `⚡ <strong>${nm.toFixed(2)} N·m</strong><br>
                            🛢️ <strong>${kgfm.toFixed(2)} kgf·m</strong><br>
                            🔧 <strong>${lbfin.toFixed(1)} lbf·in</strong>`;

        this.adicionarAoHistorico(`${valor} ${unidadeOrigem}`, `${nm.toFixed(1)} Nm`, "Torque");
    },

    // --- REPOSITÓRIO HISTÓRICO COMPARTILHADO ---
    adicionarAoHistorico(entrada, saida, contexto) {
        // Evita inserções de duplicatas consecutivas
        if (historicoConversoes.length > 0 && historicoConversoes[0].in === entrada && historicoConversoes[0].out === saida) return;

        historicoConversoes.unshift({ in: entrada, out: saida, ctx: contexto });
        if (historicoConversoes.length > 5) historicoConversoes.pop();

        const container = document.getElementById('history-target');
        if (container) {
            container.innerHTML = `<ul class="history-list">` + 
                historicoConversoes.map(item => `
                    <li class="history-item">
                        <span>[${item.ctx}] 📥 ${item.in}</span>
                        <span>➔</span>
                        <span>📤 <strong>${item.out}</strong></span>
                    </li>
                `).join('') + `</ul>`;
        }
    }
};
