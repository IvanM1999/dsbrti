/**
 * EXTENSÃO DE RECURSOS - CORREÇÃO DE SELEÇÃO E COMPORTAMENTO
 */
window.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // RECURSO 1: Barra de Aviso no Topo (Some após 5 segundos)
    // ==========================================
    const emitirAlertaDesenvolvimento = () => {
        const barraAlerta = document.createElement('div');
        barraAlerta.id = 'patch-top-bar';
        
        barraAlerta.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%;
            background: #E95420; color: #ffffff; padding: 12px 20px;
            text-align: center; font-family: 'Ubuntu', sans-serif; font-size: 14px;
            z-index: 999999; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center; gap: 15px;
            box-sizing: border-box; transition: transform 0.5s ease, opacity 0.5s ease;
        `;

        barraAlerta.innerHTML = `
            <span><i class="fa-solid fa-triangle-exclamation"></i> <strong>SISTEMA EM DESENVOLVIMENTO:</strong> Solicitações de recursos devem ser redirecionadas ao suporte.</span>
            <a href="https://wa.me/5547984863051?text=Olá,%20gostaria%20de%20solicitar%20um%20recurso" 
               target="_blank" 
               style="background: #25D366; color: white; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp (+55047984863051)
            </a>
        `;

        document.body.prepend(barraAlerta);

        // Armazena o padding original para restaurar depois
        const originalPadding = window.getComputedStyle(document.body).paddingTop;
        document.body.style.paddingTop = "50px";
        document.body.style.transition = "padding-top 0.5s ease";

        setTimeout(() => {
            barraAlerta.style.transform = 'translateY(-100%)';
            barraAlerta.style.opacity = '0';
            document.body.style.paddingTop = originalPadding;
            setTimeout(() => barraAlerta.remove(), 500);
        }, 5000);
    };

    emitirAlertaDesenvolvimento();


    // ==========================================
    // RECURSO 2: Correção do Botão "Ubuntu system core"
    // ==========================================
    
    // Varre de forma agressiva todos os elementos do header para achar o texto correto
    const buscarBotaoUbuntu = () => {
        // Primeiro tenta encontrar pela classe padrão de badges de tema do Ubuntu/Linux
        let elemento = document.querySelector('.theme-badge') || document.querySelector('.brand-badge') || document.querySelector('.logo-subtext');
        
        // Se não achar por classe, varre todo o documento procurando pelo termo textual exato (ignorando maiúsculas)
        if (!elemento) {
            const todosOsElementos = document.querySelectorAll('header *, nav *, span, div, p');
            for (let el of todosOsElementos) {
                const textoLimpo = el.textContent.toLowerCase().trim();
                if (textoLimpo.includes('ubuntu system core') || textoLimpo.includes('ubuntu core') || textoLimpo === 'ubuntu') {
                    elemento = el;
                    break;
                }
            }
        }
        return elemento;
    };

    const botaoUbuntu = buscarBotaoUbuntu();

    if (botaoUbuntu) {
        // Estiliza o elemento original para se comportar visivelmente como um botão interativo
        botaoUbuntu.style.cursor = 'pointer';
        botaoUbuntu.style.transition = 'all 0.2s ease';
        botaoUbuntu.style.userSelect = 'none';
        botaoUbuntu.setAttribute('title', 'Clique para ver o significado de Ubuntu');
        
        // Efeito visual ao passar o mouse (Hover)
        botaoUbuntu.addEventListener('mouseenter', () => {
            botaoUbuntu.style.opacity = '0.8';
            botaoUbuntu.style.textDecoration = 'underline';
        });
        botaoUbuntu.addEventListener('mouseleave', () => {
            botaoUbuntu.style.opacity = '1';
            botaoUbuntu.style.textDecoration = 'none';
        });

        // Evento de Clique para renderizar a caixa informativa
        botaoUbuntu.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique feche a si mesmo imediatamente
            
            // Se já estiver aberto, fecha
            const popoverExistente = document.getElementById('patch-ubuntupopover');
            if (popoverExistente) {
                popoverExistente.remove();
                return;
            }

            // Descobre a posição exata do botão clicado na tela para alinhar o balão abaixo dele
            const rect = botaoUbuntu.getBoundingClientRect();

            const popover = document.createElement('div');
            popover.id = 'patch-ubuntupopover';
            
            // Estilização com a paleta oficial Ubuntu (Aubergine e Laranja)
            popover.style.cssText = `
                position: fixed;
                top: ${rect.bottom + 10}px;
                left: ${Math.max(10, rect.left - 40)}px;
                background: #77216F; /* Berinjela Ubuntu */
                color: #ffffff;
                padding: 12px 16px;
                border-radius: 4px;
                max-width: 280px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.6);
                font-family: 'Ubuntu', sans-serif;
                font-size: 13px;
                line-height: 1.4;
                border-left: 4px solid #E95420; /* Laranja Ubuntu */
                z-index: 1000000;
                pointer-events: auto;
                animation: patchFadeIn 0.2s ease-out;
            `;
            
            popover.innerHTML = `
                <div style="font-weight: bold; color: #E95420; margin-bottom: 4px;">Significado de Ubuntu:</div>
                Filosofia africana que significa <strong>"Eu sou porque nós somos"</strong>. É uma diretriz baseada na interconexão, colaboração e respeito mútuo entre as pessoas.
            `;

            document.body.appendChild(popover);

            // Adiciona animação de surgimento se não houver no CSS global
            if (!document.getElementById('patch-animation-style')) {
                const style = document.createElement('style');
                style.id = 'patch-animation-style';
                style.innerHTML = `@keyframes patchFadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`;
                document.head.appendChild(style);
            }

            // Fecha a janela se clicar em qualquer outro lugar fora dela
            const fecharAoClicarFora = (evt) => {
                if (!popover.contains(evt.target) && evt.target !== botaoUbuntu) {
                    popover.remove();
                    document.removeEventListener('click', fecharAoClicarFora);
                }
            };
            setTimeout(() => document.addEventListener('click', fecharAoClicarFora), 10);
        });
    } else {
        console.warn("Aviso: O elemento 'Ubuntu system core' não foi localizado mapeando o DOM textual. Certifique-se de carregar este patch após o HTML.");
    }
});
