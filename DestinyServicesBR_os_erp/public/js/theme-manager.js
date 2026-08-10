/**
 * Controla os ecossistemas industriais (Ubuntu, Linux Mint, Windows 11)[span_6](start_span)[span_6](end_span)
 * com persistência local e fallback automático por faixa de horário.[span_7](start_span)[span_7](end_span)
 */

const GerenciadorTemasIndustrial = {
    TABELA_TEMAS: {
        'ubuntu': { id: 'ubuntu', nome: 'Ubuntu OS', temaBarra: '#E95420' },[span_8](start_span)[span_8](end_span)
        'fedora': { id: 'fedora', nome: 'Linux Mint', temaBarra: '#141916' },[span_9](start_span)[span_9](end_span)
        'winxp':  { id: 'winxp',  nome: 'Windows 11', temaBarra: '#0e1118' }[span_10](start_span)[span_10](end_span)
    },

    CHAVE_STORAGE: 'dsbrti_tema_preferido',[span_11](start_span)[span_11](end_span)

    config: {
        horaNoite: 18,[span_12](start_span)[span_12](end_span)
        horaDia: 6,[span_13](start_span)[span_13](end_span)
        intervaloVerificacao: 60000[span_14](start_span)[span_14](end_span)
    },

    inicializar() {
        this.aplicarTemaLogicaPrevia();[span_15](start_span)[span_15](end_span)

        if (document.readyState === 'loading') {[span_16](start_span)[span_16](end_span)
            document.addEventListener('DOMContentLoaded', () => this.sincronizarBotoesUI());[span_17](start_span)[span_17](end_span)
        } else {
            this.sincronizarBotoesUI();[span_18](start_span)[span_18](end_span)
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.verificarMudancaAutomatica());[span_19](start_span)[span_19](end_span)
        setInterval(() => this.verificarMudancaAutomatica(), this.config.intervaloVerificacao);[span_20](start_span)[span_20](end_span)
    },

    obterTemaCalculado() {
        const temaSalvo = localStorage.getItem(this.CHAVE_STORAGE);[span_21](start_span)[span_21](end_span)
        if (temaSalvo && this.TABELA_TEMAS[temaSalvo]) {[span_22](start_span)[span_22](end_span)
            return temaSalvo;[span_23](start_span)[span_23](end_span)
        }

        const prefereEscuroSO = window.matchMedia('(prefers-color-scheme: dark)').matches;[span_24](start_span)[span_24](end_span)
        if (prefereEscuroSO) {[span_25](start_span)[span_25](end_span)
            return 'fedora';[span_26](start_span)[span_26](end_span)
        }

        const horaAtual = new Date().getHours();[span_27](start_span)[span_27](end_span)
        const ehTurnoNoite = (horaAtual >= this.config.horaNoite || horaAtual < this.config.horaDia);[span_28](start_span)[span_28](end_span)

        if (ehTurnoNoite) {[span_29](start_span)[span_29](end_span)
            return 'winxp';[span_30](start_span)[span_30](end_span)
        }

        return 'ubuntu';[span_31](start_span)[span_31](end_span)
    },

    aplicarTemaLogicaPrevia() {
        const temaAlvo = this.obterTemaCalculado();[span_32](start_span)[span_32](end_span)
        const htmlElement = document.documentElement;[span_33](start_span)[span_33](end_span)

        htmlElement.setAttribute('data-theme', temaAlvo);[span_34](start_span)[span_34](end_span)

        const metaTheme = document.querySelector('meta[name="theme-color"]');[span_35](start_span)[span_35](end_span)
        if (metaTheme && this.TABELA_TEMAS[temaAlvo]) {[span_36](start_span)[span_36](end_span)
            metaTheme.setAttribute('content', this.TABELA_TEMAS[temaAlvo].temaBarra);[span_37](start_span)[span_37](end_span)
        }

        this.atualizarBotoesAtivosUI(temaAlvo);[span_38](start_span)[span_38](end_span)
    },

    salvarPredefinicaoUsuario(idTema) {
        if (this.TABELA_TEMAS[idTema]) {[span_39](start_span)[span_39](end_span)
            localStorage.setItem(this.CHAVE_STORAGE, idTema);[span_40](start_span)[span_40](end_span)
            this.aplicarTemaLogicaPrevia();[span_41](start_span)[span_41](end_span)
        }
    },

    verificarMudancaAutomatica() {
        if (localStorage.getItem(this.CHAVE_STORAGE)) return;[span_42](start_span)[span_42](end_span)
        this.aplicarTemaLogicaPrevia();[span_43](start_span)[span_43](end_span)
    },

    sincronizarBotoesUI() {
        const botoes = document.querySelectorAll('.theme-switcher .theme-btn');[span_44](start_span)[span_44](end_span)
        
        botoes.forEach(botao => {
            const idTema = botao.getAttribute('data-theme');[span_45](start_span)[span_45](end_span)
            const novoBotao = botao.cloneNode(true);[span_46](start_span)[span_46](end_span)
            botao.parentNode.replaceChild(novoBotao, botao);[span_47](start_span)[span_47](end_span)

            novoBotao.addEventListener('click', () => {
                this.salvarPredefinicaoUsuario(idTema);[span_48](start_span)[span_48](end_span)
            });
        });

        const temaAtual = document.documentElement.getAttribute('data-theme') || 'ubuntu';[span_49](start_span)[span_49](end_span)
        this.atualizarBotoesAtivosUI(temaAtual);[span_50](start_span)[span_50](end_span)
    },

    atualizarBotoesAtivosUI(temaAtivo) {
        const botoes = document.querySelectorAll('.theme-switcher .theme-btn');[span_51](start_span)[span_51](end_span)
        botoes.forEach(botao => {
            if (botao.getAttribute('data-theme') === temaAtivo) {[span_52](start_span)[span_52](end_span)
                botao.classList.add('active');[span_53](start_span)[span_53](end_span)
            } else {
                botao.classList.remove('active');[span_54](start_span)[span_54](end_span)
            }
        });
    }
};

GerenciadorTemasIndustrial.inicializar();[span_55](start_span)[span_55](end_span)
