/**
 * ============================================================================
 * INTEGRATION ENGINE, THEME MANAGER & ORCHESTRATOR (core.js)
 * Controlador Central de Temas, Renderização Dinâmica e Filtros da SPA
 * ============================================================================
 */

window.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o Gerenciador de Temas Operacionais
    inicializarGerenciadorTemas();

    // 2. Inicializa a Renderização de Cards Técnicos (Se houver containers na página)
    renderizarTodosModulosCards();

    // 3. Inicializa o Motor de Busca Omnibox de Forma Segura
    const omnibox = document.getElementById('engine-omnibox');
    if (omnibox) {
        omnibox.addEventListener('input', (e) => {
            executarVarreduraOmnibox(e.target.value);
        });
    }
});

/**
 * --- MOTOR DE GERENCIAMENTO DE TEMAS (SISTEMAS OPERACIONAIS) ---
 * Controla a alternância estética entre Ubuntu, Fedora e Windows XP com persistência
 */
function inicializarGerenciadorTemas() {
    const botoesTema = document.querySelectorAll('.theme-btn');
    const temaSalvo = localStorage.getItem('industrial-theme') || 'ubuntu';

    // Aplica o tema inicial recuperado do armazenamento local
    document.documentElement.setAttribute('data-theme', temaSalvo);

    // Atualiza o estado visual do botão ativo no carregamento inicial
    botoesTema.forEach(btn => {
        if (btn.getAttribute('data-theme') === temaSalvo) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        // Adiciona o evento de clique para transmutação de ecossistema visual
        btn.addEventListener('click', () => {
            const novoTema = btn.getAttribute('data-theme');
            
            // Aplica o novo tema na raiz do documento HTML
            document.documentElement.setAttribute('data-theme', novoTema);
            
            // Salva a escolha do usuário no storage do navegador
            localStorage.setItem('industrial-theme', novoTema);

            // Atualiza a classe ativa nos botões
            botoesTema.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            console.log(`%c⚙️ Sistema: Ecossistema visual transmutado para [ ${novoTema.toUpperCase()} ]`, 'color: #92b73e; font-weight: bold;');
        });
    });
}

/**
 * --- CONTROLADOR DE ABAS DA INTERFACE (SPA TABS) ---
 */
function mudarAbaAtiva(idAba, botao) {
    document.querySelectorAll('.data-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));

    const painelAlvo = document.getElementById(idAba);
    if (painelAlvo) painelAlvo.classList.add('active');
    if (botao) botao.classList.add('active');
}

/**
 * --- RENDERIZADOR DE MATRIZES DE CARTÕES INDUSTRIAS ---
 * Constrói as views analíticas a partir do banco de dados (db_industrial.js) se as áreas existirem
 */
function renderizarTodosModulosCards() {
    // Bloco 1: Usinagem
    const usTarget = document.getElementById('target-cards-usinagem');
    if (usTarget && typeof BASE_USINAGEM !== 'undefined') {
        usTarget.innerHTML = BASE_USINAGEM.map(r => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${r.setor}</span>
                <div class="card-header-tech">${r.bitola}</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Tipo Perfil</span><span class="data-item-value">${r.tipo}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Passo Nominal</span><span class="data-item-value">${r.passo}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Ø Menor Interno</span><span class="data-item-value">${r.d_menor}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Ø Broca Furo</span><span class="data-item-value" style="color:var(--primary);">${r.broca}</span></div>
                </div>
            </div>
        `).join('');
    }

    // Bloco 2: Tolerâncias
    const tolTarget = document.getElementById('target-cards-tolerancias');
    if (tolTarget && typeof BASE_TOLERANCIAS !== 'undefined') {
        tolTarget.innerHTML = BASE_TOLERANCIAS.map(a => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${a.setor}</span>
                <div class="card-header-tech">Classe ISO [ ${a.classe} ]</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Elemento Alvo</span><span class="data-item-value">${a.tipo}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Afast. Superior</span><span class="data-item-value" style="color:var(--warning);">${a.es}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Afast. Inferior</span><span class="data-item-value" style="color:var(--warning);">${a.ei}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Acoplamento</span><span class="data-item-value">${a.acopl}</span></div>
                </div>
                <div class="data-item-desc"><strong>Aplicação Técnica:</strong> ${a.aplicacao}</div>
            </div>
        `).join('');
    }

    // Bloco 3: Eletrônica
    const elTarget = document.getElementById('target-cards-eletronica');
    if (elTarget && typeof BASE_ELETRONICA !== 'undefined') {
        elTarget.innerHTML = BASE_ELETRONICA.map(e => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${e.setor}</span>
                <div class="card-header-tech">${e.interface}</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Família Sinal</span><span class="data-item-value">${e.tipo}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Níveis Físicos</span><span class="data-item-value" style="color:var(--secondary);">${e.niveis}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Impedância Z</span><span class="data-item-value">${e.impedancia}</span></div>
                </div>
                <div class="data-item-desc"><strong>Conduta em Malha:</strong> ${e.uso}</div>
            </div>
        `).join('');
    }

    // Bloco 4: Ultrassom
    const utTarget = document.getElementById('target-cards-ultrassom');
    if (utTarget && typeof BASE_ULTRASSOM !== 'undefined') {
        utTarget.innerHTML = BASE_ULTRASSOM.map(u => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${u.setor}</span>
                <div class="card-header-tech">${u.material}</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Vel. Longitudinal</span><span class="data-item-value" style="color:var(--success);">${u.v_long}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Vel. Transversal</span><span class="data-item-value">${u.v_trans}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Impedância Acústica</span><span class="data-item-value">${u.impedancia}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Atenuação</span><span class="data-item-value">${u.atenuacao}</span></div>
                </div>
            </div>
        `).join('');
    }

    // Bloco 5: Fundição
    const fundTarget = document.getElementById('target-cards-fundicao');
    if (fundTarget && typeof BASE_FUNDICAO !== 'undefined') {
        fundTarget.innerHTML = BASE_FUNDICAO.map(f => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${f.setor}</span>
                <div class="card-header-tech">${f.liga}</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Taxa Contraç. Linear</span><span class="data-item-value" style="color:var(--secondary);">${f.contracao}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Temp. Vazamento</span><span class="data-item-value">${f.temp_vaz}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Fluidez Relativa</span><span class="data-item-value">${f.fluidez}</span></div>
                </div>
                <div class="data-item-desc" style="color:var(--warning);"><strong>Defeito Comum:</strong> ${f.anomalias}</div>
            </div>
        `).join('');
    }
}

/**
 * --- INTERCEPTOR COGNITIVO E MOTOR DE BUSCA OMNIBOX ---
 * Realiza filtragens e renderiza insights rápidos na parte superior da UI
 */
function ejecutarVarreduraOmnibox(busca) {
    const painelNeural = document.getElementById('neural-box');
    const alvoInsights = document.getElementById('neural-insights-target');
    const query = busca.toLowerCase().trim().replace(',', '.');

    // Reset imediato se a caixa de pesquisa for esvaziada
    if (query === "") {
        if (painelNeural) painelNeural.style.display = "none";
        document.querySelectorAll('.industrial-card').forEach(c => c.classList.remove('hide'));
        return;
    }

    let insightsCoincidentes = [];

    // Cruzamentos Heurísticos na Base de Dados de Usinagem
    if (typeof BASE_USINAGEM !== 'undefined') {
        BASE_USINAGEM.filter(r => r.bitola.toLowerCase().includes(query)).forEach(r => {
            insightsCoincidentes.push(`<div class="neural-card">⚠️ <strong>Usinagem Direta:</strong> Rosca <strong>${r.bitola}</strong> requer broca de <strong>${r.broca}</strong> no pré-furo CNC.</div>`);
        });
    }

    // Cruzamentos Heurísticos na Base de Dados de Tolerâncias
    if (typeof BASE_TOLERANCIAS !== 'undefined') {
        BASE_TOLERANCIAS.filter(t => t.classe.toLowerCase() === query).forEach(t => {
            insightsCoincidentes.push(`<div class="neural-card" style="border-left-color: var(--warning);">📏 <strong>Metrologia Fina:</strong> Campo ${t.classe} ([${t.faixa}]). Desvios: ES: ${t.es} | EI: ${t.ei}.</div>`);
        });
    }

    // Cruzamentos Heurísticos na Base de Dados de Eletrônica
    if (typeof BASE_ELETRONICA !== 'undefined') {
        BASE_ELETRONICA.filter(e => e.interface.toLowerCase().includes(query)).forEach(e => {
            insightsCoincidentes.push(`<div class="neural-card" style="border-left-color: var(--secondary);">⚡ <strong>Automação:</strong> Protocolo ${e.interface} opera em <code>${e.niveis}</code>.</div>`);
        });
    }

    // Gerencia o painel superior de Insights Cognitivos
    if (painelNeural && alvoInsights) {
        if (insightsCoincidentes.length > 0) {
            painelNeural.style.display = "block";
            alvoInsights.innerHTML = insightsCoincidentes.join('');
        } else {
            painelNeural.style.display = "none";
        }
    }

    // Filtro em lote (Batch Hide/Show) de todos os cards da página
    document.querySelectorAll('.industrial-card').forEach(card => {
        const payloadTexto = card.textContent.toLowerCase().replace(',', '.');
        if (payloadTexto.includes(query)) {
            card.classList.remove('hide');
        } else {
            card.classList.add('hide');
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
  const hostname = window.location.hostname;
  
  // Verifica se o acesso está sendo feito pelo domínio isolado do Render
  if (hostname.includes("metrologia.onrender.com")) {
    document.documentElement.classList.add("is-isolated");
  }
});
