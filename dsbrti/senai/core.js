/**
 * ORQUESTRADOR GLOBAL DA GUI CORPORATIVA (core.js)
 * Seguro para rodar tanto na Raiz quanto nas subpastas.
 */
window.addEventListener('DOMContentLoaded', () => {
    // 1. Só renderiza os cards técnicos se os containers existirem na página atual
    if (document.getElementById('target-cards-usinagem') || 
        document.getElementById('target-cards-tolerancias') || 
        document.getElementById('target-cards-manutencao')) {
        renderizarMatrizesDeDadosCards();
    }
    
    // 2. Só ativa o barramento de busca se a Omnibox existir na página atual
    const omnibox = document.getElementById('engine-omnibox');
    if (omnibox) {
        omnibox.addEventListener('input', (e) => {
            executarBarramentoBuscaHeuristica(e.target.value);
        });
    }
    
    // 3. Só inicializa o template do CLP se o motor de cálculos estiver ativo
    if (typeof engineCalculos !== 'undefined' && engineCalculos.gerarTemplateSCL) {
        if (document.getElementById('res-clp-scl')) {
            engineCalculos.gerarTemplateSCL();
        }
    }
});

function mudarAbaAtiva(idAba, botao) {
    document.querySelectorAll('.data-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
         
    const painelAlvo = document.getElementById(idAba);
    if (painelAlvo) painelAlvo.classList.add('active');
    if (botao) botao.classList.add('active');
}

function renderizarMatrizesDeDadosCards() {
    if (typeof BASE_USINAGEM !== 'undefined') {
        const usTarget = document.getElementById('target-cards-usinagem');
        if (usTarget) {
            usTarget.innerHTML = BASE_USINAGEM.map(r => `
                <div class="industrial-card relative-card">
                    <span class="badge-sector">${r.setor}</span>
                    <div class="card-header-tech">${r.bitola}</div>
                    <div class="tech-data-row">
                        <div class="data-item-box"><span class="data-item-title">Tipo</span><span class="data-item-value">${r.tipo}</span></div>
                        <div class="data-item-box"><span class="data-item-title">Passo</span><span class="data-item-value">${r.passo}</span></div>
                        <div class="data-item-box"><span class="data-item-title">Ø-Broca</span><span class="data-item-value" style="color:var(--ubuntu-orange);">${r.broca}</span></div>
                    </div>
                </div>
            `).join('');
        }
    }
         
    if (typeof BASE_TOLERANCIAS !== 'undefined') {
        const tolTarget = document.getElementById('target-cards-tolerancias');
        if (tolTarget) {
            tolTarget.innerHTML = BASE_TOLERANCIAS.map(a => `
                <div class="industrial-card relative-card">
                    <span class="badge-sector">${a.setor}</span>
                    <div class="card-header-tech">Ajuste [ ${a.classe} ]</div>
                    <div class="tech-data-row">
                        <div class="data-item-box"><span class="data-item-title">Tipo</span><span class="data-item-value">${a.tipo}</span></div>
                        <div class="data-item-box"><span class="data-item-title">Limites</span><span class="data-item-value" style="color:#df382c;">ES:${a.es} / EI:${a.ei}</span></div>
                    </div>
                    <div class="data-item-desc"><strong>Uso:</strong> ${a.aplicacao}</div>
                </div>
            `).join('');
        }
    }
}

function ejecutarBarramentoBuscaHeuristica(busca) {
    const painelNeural = document.getElementById('neural-box');
    const alvoInsights = document.getElementById('neural-insights-target');
    const query = busca.toLowerCase().trim();
         
    if (query === "" || !painelNeural || !alvoInsights) {
        if (painelNeural) painelNeural.style.display = "none";
        document.querySelectorAll('.tech-data-row > .industrial-card').forEach(c => c.classList.remove('hide'));
        return;
    }
         
    let insightsCoincidentes = [];
         
    if (typeof BASE_USINAGEM !== 'undefined') {
        BASE_USINAGEM.filter(r => r.bitola.toLowerCase().includes(query)).forEach(r => {
            insightsCoincidentes.push(`<div class="neural-card"><strong>Macho ${r.bitola}:</strong> Requer broca piloto de <strong>${r.broca}</strong>.</div>`);
        });
    }
         
    if (insightsCoincidentes.length > 0) {
        painelNeural.style.display = "block";
        alvoInsights.innerHTML = insightsCoincidentes.join('');
    } else {
        painelNeural.style.display = "none";
    }
}
