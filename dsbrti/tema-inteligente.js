/**
 * DSBRTI - MOTOR ADAPTATIVO DE ILUMINAÇÃO ERGONÔMICA (PWA INDUSTRIAL)
 * Calcula contexto: Horário + Preferência do Sistema + Sensor de Brilho
 */

const MotorTemaIndustrial = {
    config: {
        horaNoite: 18,
        horaDia: 6,
        passoDebounce: 30000 // Reavalia a cada 30 segundos
    },

    inicializar() {
        this.analisarEConstruirContexto();
        
        // Ouvir mudanças nativas do Sistema Operacional em tempo real
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.analisarEConstruirContexto();
        });

        // Loop de verificação periódica (ajuste de horário)
        setInterval(() => this.analisarEConstruirContexto(), this.config.passoDebounce);
    },

    // Retorna estimativa de brilho/luminosidade ambiente (0 a 100)
    obterLuminosidadeAmbiente(callback) {
        // Tenta usar a Ambient Light API se o dispositivo/navegador industrial suportar
        if ('AmbientLightSensor' in window) {
            try {
                const sensor = new AmbientLightSensor();
                sensor.onreading = () => {
                    // Mapeia lux para uma escala de 0-100 aproximada para o motor
                    let brilhoEstimado = Math.min((sensor.illuminance / 500) * 100, 100);
                    callback(brilhoEstimado);
                };
                sensor.onerror = () => callback(this.obterBrilhoPorHorario());
                sensor.start();
                return;
            } catch (err) {
                // Avança para o fallback se houver bloqueio de permissão
            }
        }
        
        // Fallback baseado no contexto do relógio se não houver sensor de hardware ativo
        callback(this.obterBrilhoPorHorario());
    },

    obterBrilhoPorHorario() {
        const hora = new Date().getHours();
        // Se for horário de pico de sol (11h às 15h), assume ambiente muito claro (100% brilho necessário)
        if (hora >= 11 && hora <= 15) return 100;
        // Se for noite, assume ambiente controlado/escuro (abaixo de 40%)
        if (hora >= 18 || hora < 6) return 30;
        return 60; // Intermediário padrão padrão dia
    },

    analisarEConstruirContexto() {
        const agora = new Date();
        const horaAtual = agora.getHours();
        
        // 1. Detectar preferência do Navegador/SO
        const prefereEscuroSO = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 2. Processar com o nível de iluminância/brilho estimado
        this.obterLuminosidadeAmbiente((nivelBrilho) => {
            let temaFinal = "claro"; // Fallback de segurança mecânica

            const ehNoite = (horaAtual >= this.config.horaNoite || horaAtual < this.config.dia);
            const ehHorarioAlmoço = (horaAtual >= 12 && horaAtual <= 14);

            // --- MATRIZ DE DECISÃO ERGONÔMICA (REGRAS DO PROJETO) ---
            
            if (ehNoite) {
                // "se for depois das 18h e o brilho da tela (ou ambiente) for 100%, mantenha num modo noturno intermediário"
                if (nivelBrilho >= 80) {
                    temaFinal = "noturno-intermediario"; 
                } else {
                    temaFinal = "escuro-puro"; // Máxima proteção para galpões escuros
                }
            } 
            else if (ehHorarioAlmoço) {
                // "Se for 13h e o brilho for abaixo de 50%, tema intermediário e se for 100%, tema claro."
                if (nivelBrilho < 50) {
                    temaFinal = "intermediario-claro";
                } else {
                    temaFinal = "claro";
                }
            }
            
            // --- CONFLITO: "Se for 13h mas o navegador pede escuro, calcula todo o contexto deixando um intermediário escuro" ---
            if (!ehNoite && prefereEscuroSO) {
                // O sistema quer escuro, mas o relógio diz que é dia forte externa. 
                // Geramos o meio-termo perfeito para não ofuscar nem quebrar a preferência.
                temaFinal = "intermediario-escuro";
            }

            // Aplicar o atributo de tema na raiz do documento HTML
            document.documentElement.setAttribute('data-theme', temaFinal);
            
            // Log técnico velado para auditoria do terminal se necessário
            console.log(`[GAA] Ambiente Atualizado: ${temaFinal} (Brilho Ref: ${nivelBrilho}%, SO Dark: ${prefereEscuroSO})`);
        });
    }
};

// Execução imediata pré-renderização para evitar Flash de Luz Branca
MotorTemaIndustrial.inicializar();
