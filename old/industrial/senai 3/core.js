/**
 * ORQUESTRADOR GLOBAL DA GUI CORPORATIVA (core.js)
 */

window.addEventListener('DOMContentLoaded', () => {
    renderizarMatrizesDeDadosCards();
    document.getElementById('engine-omnibox').addEventListener('input', (e) => {
        executarBarramentoBuscaHeuristica(e.target.value);
    });
});

function mudarAbaAtiva(idAba, botao) {
    document.querySelectorAll('.data-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(idAba).classList.add('active');
    botao.classList.add('active');
}

function renderizarMatrizesDeDadosCards() {
    // Renderiza dados de furação/macho na aba Usinagem
    const usTarget = document.getElementById('target-cards-usinagem');
    if (usTarget) {
        usTarget.innerHTML = BASE_USINAGEM.map(r => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${r.setor}</span>
                <div class="card-header-tech">${r.bitola}</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Tipo Perfil</span><span class="data-item-value">${r.tipo}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Passo / Passo Fio</span><span class="data-item-value">${r.passo}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Ø Pré-Furo Broca</span><span class="data-item-value" style="color:var(--ubuntu-orange);">${r.broca}</span></div>
                </div>
            </div>
        `).join('');
    }
    
    // Renderiza dados de acoplamentos ISO na aba Desenho Técnico
    const tolTarget = document.getElementById('target-cards-tolerancias');
    if (tolTarget) {
        tolTarget.innerHTML = BASE_TOLERANCIAS.map(a => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${a.setor}</span>
                <div class="card-header-tech">Ajuste ISO [ ${a.classe} ]</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Elemento</span><span class="data-item-value">${a.tipo}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Afastamentos Limite</span><span class="data-item-value" style="color:#df382c;">ES: ${a.es} / EI: ${a.ei}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Acoplamento</span><span class="data-item-value">${a.acopl}</span></div>
                </div>
                <div class="data-item-desc"><strong>Diretriz de Desenho:</strong> ${a.aplicacao}</div>
            </div>
        `).join('');
    }
    
    // Concentra as tabelas de Eletrônica, Ultrassom e Fundição na mesma visão unificada de Manutenção Industrial
    const manTarget = document.getElementById('target-cards-manutencao');
    if (manTarget) {
        manTarget.innerHTML = BASE_MANUTENCAO.map(m => `
            <div class="industrial-card relative-card">
                <span class="badge-sector">${m.cat}</span>
                <div class="card-header-tech">${m.nome}</div>
                <div class="tech-data-row">
                    <div class="data-item-box"><span class="data-item-title">Variável Operacional</span><span class="data-item-value">${m.param1}</span></div>
                    <div class="data-item-box"><span class="data-item-title">Condição Crítica</span><span class="data-item-value">${m.param2}</span></div>
                </div>
                <div class="data-item-desc"><strong>Aplicação em Campo:</strong> ${m.desc}</div>
            </div>
        `).join('');
    }
}

function executarBarramentoBuscaHeuristica(busca) {
    const painelNeural = document.getElementById('neural-box');
    const alvoInsights = document.getElementById('neural-insights-target');
    const query = busca.toLowerCase().trim().replace(',', '.');
    
    if (query === "") {
        painelNeural.style.display = "none";
        document.querySelectorAll('.tech-data-row > .industrial-card').forEach(c => c.classList.remove('hide'));
        return;
    }
    
    let insightsCoincidentes = [];
    
    BASE_USINAGEM.filter(r => r.bitola.toLowerCase().includes(query)).forEach(r => {
        insightsCoincidentes.push(`<div class="neural-card">🛠️ <strong>Usinagem / CNC:</strong> Para fixadores passo normal <strong>${r.bitola}</strong>, o diâmetro menor nominal exige furo piloto com broca de <strong>${r.broca}</strong>.</div>`);
    });
    
    BASE_TOLERANCIAS.filter(t => t.classe.toLowerCase() === query).forEach(t => {
        insightsCoincidentes.push(`<div class="neural-card">📐 <strong>Ajustes Tolerados:</strong> O campo de acoplamento geométrico ${t.classe} indica desvios de <code>Superior: ${t.es} | Inferior: ${t.ei}</code>.</div>`);
    });
    
    if (insightsCoincidentes.length > 0) {
        painelNeural.style.display = "block";
        alvoInsights.innerHTML = insightsCoincidentes.join('');
    } else {
        painelNeural.style.display = "none";
    }
    
    // Varre e oculta os cartões inferiores dinamicamente de acordo com os termos pesquisados
    document.querySelectorAll('.tech-data-row > .industrial-card').forEach(card => {
        const payloadTexto = card.textContent.toLowerCase().replace(',', '.');
        if (payloadTexto.includes(query)) {
            card.classList.remove('hide');
        } else {
            card.classList.add('hide');
        }
    });
}