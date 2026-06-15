/**
 * DSBRTI - GERENCIADOR DE TEMAS INTELIGENTE E INTEGRADO V2.0
 * Controla os ecossistemas industriais (Ubuntu, Fedora, Windows XP)
 * com persistência local e fallback automático por faixa de horário.
 */

const GerenciadorTemasIndustrial = {
    // 1. Tabela central de controle e mapeamento de comportamento dos temas atuais
    TABELA_TEMAS: {
        'ubuntu': { id: 'ubuntu', nome: 'Ubuntu OS', padraoDia: true, temaBarra: '#E95420' },
        'fedora': { id: 'fedora', nome: 'Fedora Linux', padraoDia: false, temaBarra: '#294172' },
        'winxp':  { id: 'winxp',  nome: 'Windows XP', padraoDia: false, temaBarra: '#215dc6' }
    },

    CHAVE_STORAGE: 'dsbrti_tema_preferido',

    config: {
        horaNoite: 18, // Início do turno da noite (aplica winxp se nenhuma escolha prévia existir)
        horaDia: 6,     // Início do turno do dia
        intervaloVerificacao: 60000 // 1 minuto
    },

    inicializar() {
        // Define o tema inicial baseado nas regras prévias de seleção
        this.aplicarTemaLogicaPrevia();

        // Vincula dinamicamente os eventos dos botões existentes na UI pós-carregamento
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.sincronizarBotoesUI());
        } else {
            this.sincronizarBotoesUI();
        }

        // Monitora mudanças no esquema do Sistema Operacional ou Horário
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.verificarMudancaAutomatica());
        setInterval(() => this.verificarMudancaAutomatica(), this.config.intervaloVerificacao);
    },

    // 2. Lógica prévia de seleção com prioridades
    obterTemaCalculado() {
        // Prioridade 1: Escolha explícita salva localmente pelo usuário
        const temaSalvo = localStorage.getItem(this.CHAVE_STORAGE);
        if (temaSalvo && this.TABELA_TEMAS[temaSalvo]) {
            return temaSalvo;
        }

        // Prioridade 2: Preferência do Sistema Operacional (Dark Mode prefere Fedora/XP no ambiente industrial)
        const prefereEscuroSO = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefereEscuroSO) {
            return 'fedora';
        }

        // Prioridade 3: Fallback Inteligente baseado em faixas de Horário
        const horaAtual = new Date().getHours();
        const ehTurnoNoite = (horaAtual >= this.config.horaNoite || horaAtual < this.config.horaDia);

        if (ehTurnoNoite) {
            return 'winxp'; // Alterna automaticamente para o turno noturno
        }

        // Tema padrão de fábrica (Ubuntu)
        return 'ubuntu';
    },

    aplicarTemaLogicaPrevia() {
        const temaAlvo = this.obterTemaCalculado();
        const htmlElement = document.documentElement;

        // Injeta o atributo lido pela folha de estilos CSS
        htmlElement.setAttribute('data-theme', temaAlvo);

        // Atualiza a cor de contexto do navegador para dispositivos móveis
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme && this.TABELA_TEMAS[temaAlvo]) {
            metaTheme.setAttribute('content', this.TABELA_TEMAS[temaAlvo].temaBarra);
        }

        this.atualizarBotoesAtivosUI(temaAlvo);
    },

    // 3. Salva a predefinição localmente ao interagir com a interface
    salvarPredefinicaoUsuario(idTema) {
        if (this.TABELA_TEMAS[idTema]) {
            localStorage.setItem(this.CHAVE_STORAGE, idTema);
            this.aplicarTemaLogicaPrevia();
        }
    },

    verificarMudancaAutomatica() {
        // Se o usuário já escolheu e travou um tema localmente, respeita e não altera sozinho
        if (localStorage.getItem(this.CHAVE_STORAGE)) return;

        this.aplicarTemaLogicaPrevia();
    },

    sincronizarBotoesUI() {
        // Localiza os seletores de botões dinamicamente no cabeçalho ou navbar
        const botoes = document.querySelectorAll('.theme-switch .theme-btn, .theme-switcher .theme-btn');
        
        botoes.forEach(botao => {
            const idTema = botao.getAttribute('data-theme');
            
            // Remove listeners antigos para evitar execução duplicada
            const novoBotao = botao.cloneNode(true);
            botao.parentNode.replaceChild(novoBotao, botao);

            novoBotao.addEventListener('click', () => {
                this.salvarPredefinicaoUsuario(idTema);
            });
        });

        // Força sincronia visual imediata na UI
        const temaAtual = document.documentElement.getAttribute('data-theme') || 'ubuntu';
        this.atualizarBotoesAtivosUI(temaAtual);
    },

    atualizarBotoesAtivosUI(temaAtivo) {
        const botoes = document.querySelectorAll('.theme-switch .theme-btn, .theme-switcher .theme-btn');
        botoes.forEach(botao => {
            if (botao.getAttribute('data-theme') === temaAtivo) {
                botao.classList.add('active');
            } else {
                botao.classList.remove('active');
            }
        });
    }
};

// Execução imediata na leitura do script para mitigar o efeito de "flash branco" antes do carregamento do DOM
GerenciadorTemasIndustrial.inicializar();
