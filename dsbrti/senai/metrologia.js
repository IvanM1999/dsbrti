/**
 * DSBRTI - MOTOR ADAPTATIVO INTEGRADO & TERMINAL METROLÓGICO REATIVO
 * Gerencia Matemática de Oficina, Interface Líquida e Matriz de Iluminação
 */

let historicoConversoes = [];

const MotorMetrologiaIA = {
    // --- 1. CONFIGURAÇÕES E ESTADOS DO MOTOR DE ILUMINAÇÃO (GAA) ---
    configTema: {
        horaNoite: 18,
        horaDia: 6,
        passoDebounce: 30000
    },

    inicializarTemaInteligente() {
        this.analisarEConstruirContexto();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.analisarEConstruirContexto();
        });
        setInterval(() => this.analisarEConstruirContexto(), this.configTema.passoDebounce);
    },

    obterBrilhoPorHorario() {
        const hora = new Date().getHours();
        if (hora >= 11 && hora <= 15) return 100; // Pico do dia
        if (hora >= 18 || hora < 6) return 30;    // Turno Noturno
        return 60;                                // Intermediário Comercial
    },

    analisarEConstruirContexto() {
        const horaAtual = new Date().getHours();
        const prefereEscuroSO = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const nivelBrilho = this.obterBrilhoPorHorario(); 
        
        let temaFinal = "claro";

        const ehNoite = (horaAtual >= this.configTema.horaNoite || horaAtual < this.configTema.horaDia);
        const ehHorarioAlmoço = (horaAtual >= 12 && horaAtual <= 14);

        // Processamento das Regras de Conforto e Saúde Laboral
        if (ehNoite) {
            temaFinal = (nivelBrilho >= 80) ? "noturno-intermediario" : "escuro-puro";
        } else if (ehHorarioAlmoço) {
            temaFinal = (nivelBrilho < 50) ? "intermediario-claro" : "claro";
        }

        // Resolução de Conflitos Humano-Máquina (Ex: Sol forte de dia, mas SO programado em Escuro)
        if (!ehNoite && prefereEscuroSO) {
            temaFinal = "intermediario-escuro";
        }

        document.documentElement.setAttribute('data-theme', temaFinal);
    },

    // --- 2. INTERFACE E ALTERNÂNCIA DE INPUTS DE MEDIDA ---
    alternarCamposPolegada() {
        const origem = document.getElementById('conv-medida-origem').value;
        const painelDireto = document.getElementById('painel-input-direto');
        const painelFracao = document.getElementById('painel-input-fracionaria');

        if (origem === 'in_frac') {
            if (painelDireto) painelDireto.classList.add('hide');
            if (painelFracao) painelFracao.classList.remove('hide');
        } else {
            if (painelDireto) painelDireto.classList.remove('hide');
            if (painelFracao) painelFracao.classList.add('hide');
        }
        this.executarCalculoMetrologico();
    },

    mudarVisibilidadeFormula(visivel) {
        const painel = document.getElementById('painel-formula-passos');
        if (painel) painel.style.display = visivel ? 'block' : 'none';
        localStorage.setItem('dsbrti_exibir_formula', visivel ? 'true' : 'false');
    },

    // --- 3. CORE MATEMÁTICO DO CONVERSOR DE OFICINA ---
    executarCalculoMetrologico() {
        const origem = document.getElementById('conv-medida-origem').value;
        const destino = document.getElementById('conv-medida-destino').value;
        const output = document.getElementById('res-metrologia');
        const painelFormula = document.getElementById('painel-formula-passos');

        if (!output) return;

        let polegadaDecimalBase = 0;
        let labelEntrada = "";
        let passoTexto = "";

        // Fase 1: Identificação e captura da medida de entrada
        if (origem === 'mm') {
            const mm = parseFloat(document.getElementById('input-valor-direto').value) || 0;
            polegadaDecimalBase = mm / 25.4;
            labelEntrada = mm + " mm";
            passoTexto += `[Entrada Milímetros]: ${mm} mm\nFórmula: mm ÷ 25.4 = ${polegadaDecimalBase.toFixed(6)}"`;
        } 
        else if (origem === 'in_dec') {
            const pDec = parseFloat(document.getElementById('input-valor-direto').value) || 0;
            polegadaDecimalBase = pDec;
            labelEntrada = pDec.toFixed(4) + "\"";
            passoTexto += `[Entrada Milesimal]: Base estabelecida em ${polegadaDecimalBase.toFixed(4)}"`;
        } 
        else if (origem === 'in_frac') {
            const inteiro = parseInt(document.getElementById('frac-int').value) || 0;
            const numerador = parseInt(document.getElementById('frac-num').value) || 0;
            const denominador = parseInt(document.getElementById('frac-den').value) || 1;
            
            polegadaDecimalBase = inteiro + (numerador / denominador);
            labelEntrada = `${inteiro > 0 ? inteiro + ' ' : ''}${numerador}/${denominador}"`;
            passoTexto += `[Entrada Fracionária]: ${labelEntrada}\nCálculo: ${inteiro} + (${numerador} ÷ ${denominador}) = ${polegadaDecimalBase.toFixed(6)}"`;
        }

        // Fase 2: Transmutação para a unidade de destino
        let stringDestino = "";

        if (destino === 'mm') {
            const resultadoMm = polegadaDecimalBase * 25.4;
            stringDestino = resultadoMm.toFixed(4).replace('.', ',') + " mm";
            passoTexto += `\n\n[Conversão para Milímetros]:\nFórmula: Polegada Base × 25.4\nResultado: ${stringDestino}`;
        } 
        else if (destino === 'in_dec') {
            stringDestino = polegadaDecimalBase.toFixed(4) + "\"";
            passoTexto += `\n\n[Conversão para Polegada Milesimal]:\nResultado: ${stringDestino}`;
        } 
        else if (destino === 'in_frac') {
            const parteInteira = Math.floor(polegadaDecimalBase);
            const restoFracionario = polegadaDecimalBase - parteInteira;
            const numerador128 = Math.round(restoFracionario * 128);

            if (numerador128 === 0) {
                stringDestino = parteInteira + "\"";
            } else if (numerador128 === 128) {
                stringDestino = (parteInteira + 1) + "\"";
            } else {
                let num = numerador128;
                let den = 128;
                const obterMDC = (a, b) => b ? obterMDC(b, a % b) : a;
                const mdc = obterMDC(num, den);
                num /= mdc;
                den /= mdc;

                stringDestino = `${parteInteira > 0 ? parteInteira + ' ' : ''}${num}/${den}"`;
            }
            passoTexto += `\n\n[Conversão para Polegada Fracionária]:\nResolução Comercial (Base 1/128"): ${stringDestino}`;
        }

        // Fase 3: Renderização de Resultados
        output.innerHTML = `⚙️ Resultado: <strong>${stringDestino}</strong>`;
        if (painelFormula) painelFormula.textContent = passoTexto;

        this.adicionarAoHistorico(labelEntrada, stringDestino);
    },

    // --- 4. MOTOR DO HISTÓRICO DE SESSÃO CONTÍNUO ---
    adicionarAoHistorico(entrada, saida) {
        if (historicoConversoes.length > 0 && historicoConversoes[0].in === entrada && historicoConversoes[0].out === saida) return;

        historicoConversoes.unshift({ in: entrada, out: saida });
        if (historicoConversoes.length > 5) historicoConversoes.pop();

        const container = document.getElementById('history-target');
        if (container) {
            container.innerHTML = historicoConversoes.map(item => `
                <div class="history-item">
                    <span><i class="fa-solid fa-arrow-right-to-bracket"></i> ${item.in}</span>
                    <span><i class="fa-solid fa-right-long" style="color:var(--primary)"></i></span>
                    <span><strong>${item.out}</strong></span>
                </div>
            `).join('');
        }
    }
};

// --- BINDING CENTRALIZADO DO DOM ---
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar o Motor de Iluminação Ergonômica
    MotorMetrologiaIA.inicializarTemaInteligente();

    // Preferências do Checkbox do Passo a Passo
    const chkFormula = document.getElementById('chk-exibir-formula');
    const prefFormula = localStorage.getItem('dsbrti_exibir_formula');
    
    if (prefFormula === null) {
        localStorage.setItem('dsbrti_exibir_formula', 'true');
        if (chkFormula) chkFormula.checked = true;
        MotorMetrologiaIA.mudarVisibilidadeFormula(true);
    } else {
        const ativo = prefFormula === 'true';
        if (chkFormula) chkFormula.checked = ativo;
        MotorMetrologiaIA.mudarVisibilidadeFormula(ativo);
    }

    if (chkFormula) {
        chkFormula.addEventListener('change', (e) => {
            MotorMetrologiaIA.mudarVisibilidadeFormula(e.target.checked);
        });
    }

    // Ouvintes reativos inteligentes para atualização instantânea (Input / Select)
    const targets = ['conv-medida-origem', 'conv-medida-destino', 'input-valor-direto', 'frac-int', 'frac-num', 'frac-den'];
    targets.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const ev = el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(ev, () => {
                if (id === 'conv-medida-origem') {
                    MotorMetrologiaIA.alternarCamposPolegada();
                } else {
                    MotorMetrologiaIA.executarCalculoMetrologico();
                }
            });
        }
    });

    // Executa carga de interface padrão
    MotorMetrologiaIA.alternarCamposPolegada();
});
