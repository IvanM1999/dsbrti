/**
 * Controla os ecossistemas industriais (Ubuntu, Linux Mint, Windows 11)
 * com persistência local e fallback automático por faixa de horário.
 */

const GerenciadorTemasIndustrial = {
    TABELA_TEMAS: {
        'ubuntu': { id: 'ubuntu', nome: 'Ubuntu OS', temaBarra: '#E95420' },
        'fedora': { id: 'fedora', nome: 'Linux Mint', temaBarra: '#141916' },
        'winxp':  { id: 'winxp',  nome: 'Windows 11', temaBarra: '#0e1118' }
    },

    CHAVE_STORAGE: 'dsbrti_tema_preferido',

    config: {
        horaNoite: 18,
        horaDia: 6,
        intervaloVerificacao: 60000
    }, // Corrigido: Vírgula adicionada entre propriedades do objeto literal

    inicializar() {
        this.aplicarTemaLogicaPrevia();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.sincronizarBotoesUI());
        } else {
            this.sincronizarBotoesUI();
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery && mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', () => this.verificarMudancaAutomatica());
        }

        setInterval(() => this.verificarMudancaAutomatica(), this.config.intervaloVerificacao);
    },

    obterTemaCalculado() {
        let temaSalvo = null;
        try {
            temaSalvo = localStorage.getItem(this.CHAVE_STORAGE); // Corrigido: Protegido com try/catch
        } catch (e) {
            console.warn('Não foi possível acessar o localStorage:', e);
        }

        if (temaSalvo && this.TABELA_TEMAS[temaSalvo]) {
            return temaSalvo;
        }

        try {
            const prefereEscuroSO = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefereEscuroSO) {
                return 'fedora';
            }
        } catch (e) {
            // Fallback seguro caso matchMedia falhe
        }

        const horaAtual = new Date().getHours();
        const ehTurnoNoite = (horaAtual >= this.config.horaNoite || horaAtual < this.config.horaDia);

        if (ehTurnoNoite) {
            return 'winxp';
        }

        return 'ubuntu';
    },

    aplicarTemaLogicaPrevia() {
        const temaAlvo = this.obterTemaCalculado();
        const htmlElement = document.documentElement;
        if (!htmlElement) return; // Corrigido: Proteção contra elemento nulo

        htmlElement.setAttribute('data-theme', temaAlvo);

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme && this.TABELA_TEMAS[temaAlvo]) {
            metaTheme.setAttribute('content', this.TABELA_TEMAS[temaAlvo].temaBarra);
        }

        this.atualizarBotoesAtivosUI(temaAlvo);
    },

    salvarPredefinicaoUsuario(idTema) {
        if (this.TABELA_TEMAS[idTema]) {
            try {
                localStorage.setItem(this.CHAVE_STORAGE, idTema); // Corrigido: Protegido com try/catch
            } catch (e) {
                console.warn('Não foi possível salvar no localStorage:', e);
            }
            this.aplicarTemaLogicaPrevia();
        }
    },

    verificarMudancaAutomatica() {
        let temaSalvo = null;
        try {
            temaSalvo = localStorage.getItem(this.CHAVE_STORAGE);
        } catch (e) {
            // Ignora falhas de storage
        }
        if (temaSalvo) return;
        this.aplicarTemaLogicaPrevia();
    },

    sincronizarBotoesUI() {
        const botoes = document.querySelectorAll('.theme-switcher .theme-btn');
        if (!botoes || botoes.length === 0) return; // Corrigido: Proteção contra seletores vazios

        botoes.forEach(botao => {
            const idTema = botao.getAttribute('data-theme');
            
            // Corrigido: Evita cloneNode destrutivo usando controle de estado do listener
            if (!botao.dataset.listenerAttached) {
                botao.dataset.listenerAttached = 'true';
                botao.addEventListener('click', () => {
                    this.salvarPredefinicaoUsuario(idTema);
                });
            }
        });

        const htmlElement = document.documentElement;
        const temaAtual = (htmlElement && htmlElement.getAttribute('data-theme')) || 'ubuntu';
        this.atualizarBotoesAtivosUI(temaAtual);
    },

    atualizarBotoesAtivosUI(temaAtivo) {
        const botoes = document.querySelectorAll('.theme-switcher .theme-btn');
        if (!botoes) return;
        
        botoes.forEach(botao => {
            if (botao.getAttribute('data-theme') === temaAtivo) {
                botao.classList.add('active');
            } else {
                botao.classList.remove('active');
            }
        });
    }
};

GerenciadorTemasIndustrial.inicializar();
