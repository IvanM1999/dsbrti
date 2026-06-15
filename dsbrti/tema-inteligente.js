/**
 * DSBRTI - MOTOR DE ILUMINAÇÃO INTELIGENTE ADAPTADO ÀS CALCULADORAS DO SENAI
 */

// 1. INJEÇÃO DO MOTOR ADAPTATIVO GAA (Executa imediatamente para evitar flashes brancos)
const MotorIluminacaoIndustrial = {
    config: { horaNoite: 18, horaDia: 6, intervaloVerificacao: 30000 },

    inicializar() {
        this.processarAmbienteAtua();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.processarAmbienteAtua());
        setInterval(() => this.processarAmbienteAtua(), this.config.intervaloVerificacao);
    },

    obterBrilhoEstimado() {
        const hora = new Date().getHours();
        if (hora >= 11 && hora <= 15) return 100; // Pico do Sol
        if (hora >= 18 || hora < 6) return 30;    // Turno da Noite/Madrugada
        return 60;                                // Dia Padrão Interno
    },

    processarAmbienteAtua() {
        const horaAtual = new Date().getHours();
        const prefereEscuroSO = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const nivelBrilho = this.obterBrilhoEstimado();
        
        let temaCalculado = "claro";
        const ehNoite = (horaAtual >= this.config.horaNoite || horaAtual < this.config.horaDia);
        const ehHorarioAlmoco = (horaAtual >= 12 && horaAtual <= 14);

        // Matriz de Decisão Baseada nos Requisitos
        if (ehNoite) {
            temaCalculado = (nivelBrilho >= 80) ? "noturno-intermediario" : "escuro-puro";
        } else if (ehHorarioAlmoco) {
            temaCalculado = (nivelBrilho < 50) ? "intermediario-claro" : "claro";
        }

        // Conflito Resolvido: Dia + SO Escuro = Intermediário Escuro
        if (!ehNoite && prefereEscuroSO) {
            temaCalculado = "intermediario-escuro";
        }

        document.documentElement.setAttribute('data-env-theme', temaCalculado);
    }
};

// Execução do Motor de Tela
MotorIluminacaoIndustrial.inicializar();


// 2. EXTENSÃO SEGURO DA SUITE DE CÁLCULO ORIGINAL DO SEU PROJETO
// Mantém as assinaturas idênticas exigidas pelo seu HTML (Ex: onchange="mudarTemaOS")
window.mudarTemaOS = function(nomeClasseTema) {
    const corpo = document.getElementById('app-body') || document.body;
    if (corpo) {
        corpo.className = ""; // Limpa classes antigas
        corpo.classList.add(nomeClasseTema);
    }
};

window.mudarAba = function(idPainel, botaoAtivo) {
    document.querySelectorAll('.tab-content, .data-panel').forEach(p => p.classList.add('hide'));
    const alvo = document.getElementById(idPainel);
    if (alvo) alvo.classList.remove('hide');

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (botaoAtivo) botaoAtivo.classList.add('active');
};

// Vinculação reativa automática pós carregamento para evitar erros de leitura de inputs
document.addEventListener("DOMContentLoaded", () => {
    // Garante que as rotinas originais escutem mudanças em tempo real sem precisar de botões extras
    const inputsReativos = [
        'conv-medida-origem', 'conv-medida-destino', 'input-valor-direto', 
        'frac-int', 'frac-num', 'frac-den', 'rug-ra', 'torq-val', 'torq-origem'
    ];

    inputsReativos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            const evento = elemento.tagName === 'SELECT' ? 'change' : 'input';
            elemento.addEventListener(evento, () => {
                if (id === 'conv-medida-origem' && typeof engineCalculos !== 'undefined') {
                    engineCalculos.alternarCamposPolegada();
                }
                // Dispara o cálculo se a sua engine antiga estiver instanciada na página
                if (typeof engineCalculos !== 'undefined' && typeof engineCalculos.processarConversaoMetrologia === 'function') {
                    engineCalculos.processarConversaoMetrologia();
                }
            });
        }
    });
});
