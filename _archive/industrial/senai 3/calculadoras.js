/**
 * PROCESSAMENTO ANALÍTICO MATEMÁTICO (calculadoras.js)
 */

let historicoConversoes = [];

const engineCalculos = {
    atualizarVisibilidadeCamposConversor() {
        const origem = document.getElementById('calc-conv-origem').value;
        const divDireto = document.getElementById('wrapper-input-direto');
        const divFracao = document.getElementById('wrapper-input-fracionaria');

        if(origem === 'in_frac') {
            divDireto.classList.add('hide');
            divFracao.classList.remove('hide');
        } else {
            divDireto.classList.remove('hide');
            divFracao.classList.add('hide');
        }
    },

    executarConversaoMestre() {
        const origem = document.getElementById('calc-conv-origem').value;
        const destino = document.getElementById('calc-conv-destino').value;
        const campoResultado = document.getElementById('res-calc-conversor');

        let valorPolegadaDecimal = 0;
        let stringOrigemRepresentativa = "";

        // Passo 1: Normalização das unidades de entrada para Polegada Decimal Padrão
        if (origem === 'mm') {
            const mmVal = parseFloat(document.getElementById('calc-conv-valor').value) || 0;
            valorPolegadaDecimal = mmVal / 25.4;
            stringOrigemRepresentativa = mmVal.toFixed(3) + " mm";
        } 
        else if (origem === 'in_dec') {
            const decVal = parseFloat(document.getElementById('calc-conv-valor').value) || 0;
            valorPolegadaDecimal = decVal;
            stringOrigemRepresentativa = decVal.toFixed(4) + '"';
        } 
        else if (origem === 'in_frac') {
            const inteiro = parseInt(document.getElementById('calc-frac-int').value) || 0;
            const numerador = parseInt(document.getElementById('calc-frac-num').value) || 0;
            const denominador = parseInt(document.getElementById('calc-frac-den').value) || 1;

            const fracaoPura = numerador / denominador;
            valorPolegadaDecimal = inteiro + fracaoPura;
            stringOrigemRepresentativa = `${inteiro > 0 ? inteiro + ' ' : ''}${numerador}/${denominador}"`;
        }

        // Passo 2: Conversão da Polegada Decimal Padrão para a Unidade de Destino Desejada
        let stringSaidaFinal = "";
        
        if (destino === 'mm') {
            const resultadoMilimetros = valorPolegadaDecimal * 25.4;
            stringSaidaFinal = resultadoMilimetros.toFixed(4) + " mm";
        } 
        else if (destino === 'in_dec') {
            stringSaidaFinal = valorPolegadaDecimal.toFixed(4) + '" (Decimal)';
        } 
        else if (destino === 'in_frac') {
            stringSaidaFinal = this.converterDecimalParaFracaoPolegada(valorPolegadaDecimal);
        }

        // Renderização e Atualização do Histórico Operacional
        campoResultado.innerHTML = `🔄 Saída Calculada: <strong style="color:var(--ubuntu-orange); font-size:15px;">${stringSaidaFinal}</strong>`;
        this.registrarNoHistorico(stringOrigemRepresentativa, stringSaidaFinal);
    },

    converterDecimalParaFracaoPolegada(decimalTotal) {
        const inteiro = Math.floor(decimalTotal);
        const residuo = decimalTotal - inteiro;
        
        if (residuo < 0.0039) { // Menor que 1/128"
            return inteiro > 0 ? `${inteiro}"` : '0"';
        }

        // Aproximação linear para a base industrial de 128 avos
        const avos = Math.round(residuo * 128);
        
        if (avos === 128) {
            return `${inteiro + 1}"`;
        }

        // Simplificação matemática de fração por Máximo Divisor Comum (MDC)
        let num = avos;
        let den = 128;
        
        const mdc = (a, b) => b ? mdc(b, a % b) : a;
        const divisorComum = mdc(num, den);
        
        num /= divisorComum;
        den /= divisorComum;

        return `${inteiro > 0 ? inteiro + ' ' : ''}${num}/${den}"`;
    },

    registrarNoHistorico(entrada, saida) {
        if (historicoConversoes.length > 0 && historicoConversoes[0].in === entrada && historicoConversoes[0].out === saida) return;

        historicoConversoes.unshift({ in: entrada, out: saida });
        if (historicoConversoes.length > 4) historicoConversoes.pop();

        const target = document.getElementById('history-box-target');
        target.innerHTML = `<ul class="history-list">` + 
            historicoConversoes.map(item => `
                <li class="history-item">
                    <span>📥 ${item.in}</span>
                    <span>➔</span>
                    <span>📤 <strong>${item.out}</strong></span>
                </li>
            `).join('') + `</ul>`;
    },

    // Métodos Auxiliares de Suporte dos demais Blocos
    calcularUsinagem() {
        const vc = parseFloat(document.getElementById('calc-usin-vc').value) || 0;
        const dc = parseFloat(document.getElementById('calc-usin-dc').value) || 0;
        const fz = parseFloat(document.getElementById('calc-usin-fz').value) || 0;
        const z = parseInt(document.getElementById('calc-usin-z').value) || 1;
        const dest = document.getElementById('res-calc
