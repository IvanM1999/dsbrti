const OSINT_DATA = {
    cnpj: null, razaoSocial: null, emailRF: null, telefoneRF: null,
    lastScrapedType: null, lastScrapedDoc: null, scrapedLeaks: [],
    searchedPhone: null, phoneAbuseScore: 0, phoneLeaks: [],
    searchedEmail: null, emailLeaks: [],
    timeline: []
};

function toggleHelpModal(show) {
    const modal = document.getElementById('help-modal');
    if (modal) {
        show ? modal.classList.remove('hidden') : modal.classList.add('hidden');
    }
}

function switchTab(tab) {
    ['audit', 'contact', 'lookup', 'pwned', 'report', 'sandbox'].forEach(t => {
        const content = document.getElementById(`tab-${t}-content`);
        const btn = document.getElementById(`tab-${t}-btn`);
        if(content) content.classList.add('hidden');
        if(btn) btn.className = "flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-all";
    });
    const activeContent = document.getElementById(`tab-${tab}-content`);
    const activeBtn = document.getElementById(`tab-${tab}-btn`);
    if(activeContent) activeContent.classList.remove('hidden');
    if(activeBtn) {
        let cols = { audit:'bg-indigo-600', contact:'bg-emerald-600', lookup:'bg-purple-600', pwned:'bg-rose-600', report:'bg-amber-600', sandbox:'bg-cyan-600' };
        activeBtn.className = `flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg ${cols[tab]} text-white transition-all`;
    }
    if(tab === 'report') renderConsolidatedReport();
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

function toggleLoader(show, text = "") {
    const loader = document.getElementById('global-loader');
    const txt = document.getElementById('loader-text');
    if(loader) show ? loader.classList.remove('hidden') : loader.classList.add('hidden');
    if(txt) txt.innerText = text;
}

function logConsole(message, type = 'info') {
    const consoleLog = document.getElementById('console-log');
    if (!consoleLog) return;
    const cl = { info: 'text-blue-400', success: 'text-emerald-400', warning: 'text-amber-400', error: 'text-rose-400' };
    consoleLog.innerHTML += `<div class="${cl[type]}">[${new Date().toLocaleTimeString()}] ${message}</div>`;
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function pushTimeline(title, description, level = 'info', year = '2026') {
    OSINT_DATA.timeline.push({ title, description, level, year });
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0, pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0; pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    return true;
}

function gerarCpfValido() {
    let num = "";
    for(let i=0; i<9; i++) num += Math.floor(Math.random()*10);
    let soma = 0;
    for(let i=0; i<9; i++) soma += parseInt(num.charAt(i)) * (10 - i);
    let d1 = 11 - (soma % 11); if(d1 >= 10) d1 = 0; num += d1;
    soma = 0;
    for(let i=0; i<10; i++) soma += parseInt(num.charAt(i)) * (11 - i);
    let d2 = 11 - (soma % 11); if(d2 >= 10) d2 = 0;
    return num + d2;
}

function gerarCnpjValido() {
    let num = "";
    for(let i=0; i<8; i++) num += Math.floor(Math.random()*10);
    num += "0001";
    let peso = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for(let i=0; i<12; i++) soma += parseInt(num.charAt(i)) * peso[i];
    let d1 = soma % 11 < 2 ? 0 : 11 - (soma % 11); num += d1;
    peso = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; soma = 0;
    for(let i=0; i<13; i++) soma += parseInt(num.charAt(i)) * peso[i];
    let d2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return num + d2;
}

document.getElementById('audit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cnpj = document.getElementById('audit-cnpj').value.replace(/\D/g, '');
    const err = document.getElementById('error-audit');
    const dash = document.getElementById('audit-dashboard');
    err.classList.add('hidden'); dash.classList.add('hidden');
    if (!validarCNPJ(cnpj)) {
        err.innerText = "Rejeitado: Erro de integridade matemática no dígito verificador. Insira um CNPJ autêntico.";
        err.classList.remove('hidden'); return;
    }
    toggleLoader(true, "Consultando Receita Federal e Juntas Comerciais...");
    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if(!res.ok) throw new Error("Registro ativo não encontrado na base governamental.");
        const data = await res.json();
                 
        OSINT_DATA.cnpj = data.cnpj;
        OSINT_DATA.razaoSocial = data.razao_social;
        OSINT_DATA.emailRF = data.email;
        OSINT_DATA.telefoneRF = data.ddd_telefone_1;
        document.getElementById('aud-dash-title').innerText = data.razao_social;
        document.getElementById('aud-dash-cnpj').innerText = `CNPJ: ${data.cnpj}`;
        document.getElementById('aud-status').innerText = data.descricao_situacao_cadastral || "ATIVA";
        document.getElementById('aud-razao').innerText = data.razao_social;
        document.getElementById('aud-fantasia').innerText = data.nome_fantasia || "Ausente";
        document.getElementById('aud-cnae').innerText = data.cnae_fiscal_descricao;
        document.getElementById('aud-logradouro').innerText = `${data.logradouro}, ${data.numero}`;
        document.getElementById('aud-cidade').innerText = `${data.municipio}/${data.uf}`;
        document.getElementById('aud-cep').innerText = data.cep;
        pushTimeline("Abertura Cadastral Jurídica", `Empresa ${data.razao_social} catalogada na base nacional.`, 'info', data.data_inicio_atividade || '2019');
        dash.classList.remove('hidden');
    } catch(e) {
        err.innerText = e.message; err.classList.remove('hidden');
    } finally { 
        toggleLoader(false); 
        if (typeof lucide !== 'undefined') lucide.createIcons(); 
    }
});

document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetType = document.getElementById('osint-target-type').value;
    const documentRaw = document.getElementById('contact-document').value.replace(/\D/g, '');
    const err = document.getElementById('error-crawler');
    const resultsSection = document.getElementById('contact-results');
    const container = document.getElementById('multi-osint-container');
         
    if(err) err.classList.add('hidden');
    resultsSection.classList.add('hidden');
    if (targetType === "CPF" && !validarCPF(documentRaw)) {
        err.innerText = "Falha algorítmica: O CPF inserido é matematicamente inválido.";
        err.classList.remove('hidden'); return;
    }
    if (targetType === "CNPJ" && !validarCNPJ(documentRaw)) {
        err.innerText = "Falha algorítmica: O CNPJ inserido possui dígitos verificadores inconsistentes.";
        err.classList.remove('hidden'); return;
    }
    document.getElementById('console-log').innerHTML = '';
    toggleLoader(true, `Consultando base descentralizada de logs para ${targetType}...`);
    OSINT_DATA.lastScrapedType = targetType;
    OSINT_DATA.lastScrapedDoc = documentRaw;
    logConsole(`Efetuando chamada de rede para processamento estruturado: ${documentRaw}`, "info");
    try {
        const res = await fetch('/api/validate/document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docType: targetType, document: documentRaw })
        });
        const data = await res.json();
        if (data.error) {
            logConsole(`Erro retornado do servidor: ${data.error}`, "error");
            if(err) { err.innerText = data.error; err.classList.remove('hidden'); }
            return;
        }
        OSINT_DATA.scrapedLeaks = data.leaks || [];
        container.innerHTML = OSINT_DATA.scrapedLeaks.map(lk => `
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-rose-400 font-bold block mb-1">[REGISTRO HISTÓRICO] ${lk.title} (${lk.year})</span>
                <span class="text-slate-400">${lk.detail}</span>
            </div>
        `).join('');
        OSINT_DATA.scrapedLeaks.forEach(lk => pushTimeline(`Incidente: ${lk.title}`, lk.detail, 'danger', lk.year));
        logConsole("A análise de visibilidade de metadados pública foi retornada com integridade.", "success");
        resultsSection.classList.remove('hidden');
    } catch (fetchErr) {
        logConsole("A conexão com a API do servidor falhou.", "error");
        if(err) { err.innerText = "Erro ao conectar-se com o motor central do back-end."; err.classList.remove('hidden'); }
    } finally {
        toggleLoader(false);
    }
});

document.getElementById('lookup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phoneInput = document.getElementById('lookup-phone').value;
    const results = document.getElementById('lookup-results');
    const leakContainer = document.getElementById('phone-leak-container');
         
    if(!phoneInput) return;
    results.classList.add('hidden');
    toggleLoader(true, "Rastreando barramentos de operadoras e prefixos geográficos em tempo real...");
    try {
        const response = await fetch('/api/osint/phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneInput })
        });
        const data = await response.json();
        if (data.error) { alert(data.error); return; }
        OSINT_DATA.searchedPhone = data.phone;
        OSINT_DATA.phoneAbuseScore = data.valid ? 15 : 85;
        document.getElementById('look-spam-score').innerText = data.valid ? "Formato Válido" : "Inconsistente";
        document.getElementById('look-abuse-tag').innerText = `TIPO: ${data.line_type} | UF: ${data.state}`;
        document.getElementById('look-abuse-tag').className = data.valid ? "text-emerald-400 font-bold" : "text-rose-400 font-bold";
        document.getElementById('look-carrier').innerText = data.message;
        const listaCidades = data.cities.slice(0, 8).join(', ') + (data.cities.length > 8 ? '...' : '');
                 
        leakContainer.innerHTML = `
            <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-[11px] space-y-1">
                <span class="text-purple-400 font-bold block">[Escopo de Cobertura Pública]</span>
                <p class="text-slate-300"><strong>Cidades do Prefixo:</strong> ${listaCidades}</p>
                <p class="text-slate-500 mt-2 text-[10px] italic">Origem da informação extraída: Registro Nacional de Prefixos e Numeração (BrasilAPI).</p>
            </div>
        `;
        pushTimeline("Mapeamento Telefônico Real", `Linha identificada na infraestrutura do estado de ${data.state}.`, 'info', '2026');
        results.classList.remove('hidden');
    } catch (err) {
        console.error("Falha ao comunicar-se com a API do Servidor:", err);
        alert("Erro interno: Verifique se o servidor node está ativo e escutando.");
    } finally {
        toggleLoader(false);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
});

document.getElementById('pwned-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('pwned-email').value.trim();
    const results = document.getElementById('pwned-results');
    const card = document.getElementById('pwned-status-card');
    const container = document.getElementById('breaches-container');
         
    if(!emailInput) return;
    results.classList.add('hidden');
    toggleLoader(true, "Interrogando logs globais e tabelas de credenciais vazadas...");
    OSINT_DATA.searchedEmail = emailInput;
    try {
        const response = await fetch('/api/osint/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput })
        });
        const data = await response.json();
        OSINT_DATA.emailLeaks = data.leaks || [];
        if(data.status === "INTEGRO" || OSINT_DATA.emailLeaks.length === 0) {
            card.className = "p-5 rounded-2xl border border-emerald-900 bg-emerald-950/30 flex flex-col md:flex-row justify-between items-center gap-4";
            document.getElementById('pwned-alert-title').innerText = "E-mail sem Ocorrências Cadastradas";
            document.getElementById('pwned-alert-title').className = "text-xl font-black text-emerald-400";
            document.getElementById('pwned-alert-desc').innerText = data.message || "Endereço corporativo limpo nos repositórios globais monitorados.";
            document.getElementById('pwned-badge').className = "text-xs font-bold bg-emerald-950 border border-emerald-800 text-emerald-400 px-3 py-1 rounded-full";
            document.getElementById('pwned-badge').innerText = "INTEGRO";
            container.innerHTML = "";
        } else {
            card.className = "p-5 rounded-2xl border border-rose-900 bg-rose-950/30 flex flex-col md:flex-row justify-between items-center gap-4";
            document.getElementById('pwned-alert-title').innerText = data.status === "AVISO" ? "Verificação Concluída (Ambiente)" : "Credenciais Expostas Encontradas!";
            document.getElementById('pwned-alert-title').className = data.status === "AVISO" ? "text-xl font-black text-amber-400" : "text-xl font-black text-rose-500";
            document.getElementById('pwned-alert-desc').innerText = data.message;
            document.getElementById('pwned-badge').className = data.status === "AVISO" ? "text-xs font-bold bg-amber-950 border border-amber-800 text-amber-400 px-3 py-1 rounded-full" : "text-xs font-bold bg-rose-950 border border-rose-800 text-rose-400 px-3 py-1 rounded-full";
            document.getElementById('pwned-badge').innerText = data.status;
            container.innerHTML = OSINT_DATA.emailLeaks.map(b => `
                <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl font-mono text-xs space-y-1">
                    <div class="flex justify-between items-center mb-2">
                        <strong class="text-white text-sm">${b.name}</strong>
                        <span class="text-amber-400 text-[10px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/30">${b.year}</span>
                    </div>
                    <p class="text-slate-300"><span class="text-slate-500 font-bold">[Contexto]:</span> ${b.description}</p>
                    <p class="text-rose-400"><span class="text-slate-500 font-bold">[Impacto]:</span> ${b.impact}</p>
                    <div class="p-2 bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 rounded-lg mt-2 text-[11px]">
                        <strong>Plano de Ação:</strong> ${b.fix}
                    </div>
                </div>
            `).join('');
            OSINT_DATA.emailLeaks.forEach(b => pushTimeline("Comprometimento de Credenciais", `Vazamento público localizado na base do site ${b.name}.`, "danger", b.year));
        }
        results.classList.remove('hidden');
    } catch (err) {
        console.error("Falha na varredura externa de e-mails:", err);
        alert("Erro de conexão ao processar verificação de e-mail.");
    } finally {
        toggleLoader(false);
    }
});

function renderConsolidatedReport() {
    const targetNode = document.getElementById('node-target');
    if (OSINT_DATA.lastScrapedDoc) targetNode.innerText = `[${OSINT_DATA.lastScrapedType}] ${OSINT_DATA.lastScrapedDoc}`;
    else if (OSINT_DATA.cnpj) targetNode.innerText = `[CNPJ] ${OSINT_DATA.cnpj}`;
    else targetNode.innerText = "Nenhum alvo analisado nesta sessão.";
    let score = 0; let vulns = [];
    if (OSINT_DATA.cnpj) score += 15;
    if (OSINT_DATA.scrapedLeaks.length > 0) { score += 25; vulns.push("Exposição estruturada em indexadores web."); }
    if (OSINT_DATA.phoneAbuseScore > 50) { score += 30; vulns.push("Vinculação a redes de spam ou chaves Pix expostas."); }
    if (OSINT_DATA.emailLeaks.length > 0) { score += 30; vulns.push("Passwords ou chaves criptográficas corporativas comprometidas."); }
    const scoreDisplay = document.getElementById('risk-score-display');
    scoreDisplay.innerText = `${score}%`;
    scoreDisplay.className = score > 60 ? "text-3xl font-black text-rose-500" : (score > 25 ? "text-3xl font-black text-amber-400" : "text-3xl font-black text-emerald-400");
    document.getElementById('vulnerability-list').innerHTML = vulns.length ? vulns.map(v => `<li>${v}</li>`).join('') : '<li class="text-slate-600 italic">Nenhuma anomalia crítica detetada</li>';
    const timelineContainer = document.getElementById('timeline-container');
    if(OSINT_DATA.timeline.length === 0) {
        timelineContainer.innerHTML = '<div class="text-slate-500 italic">Submeta consultas válidas para preencher a cronologia estruturada.</div>';
    } else {
        const sorted = [...OSINT_DATA.timeline].sort((a,b) => String(a.year).localeCompare(String(b.year)));
        timelineContainer.innerHTML = sorted.map(item => `
            <div class="timeline-item ${item.level === 'danger' ? 'danger' : ''}">
                <span class="text-amber-400 font-bold block">[Ano ${item.year}] ${item.title}</span>
                <span class="text-slate-400 text-xs block mt-0.5">${item.description}</span>
            </div>
        `).join('');
    }
}

const NOMES_MOCK = ["Alexandre Silva", "Beatriz Medeiros", "Carlos Henrique Souza", "Daniela Fontes", "Eduardo Krauss"];
const CARGOS_MOCK = ["Fullstack Engineer", "Security Researcher", "Cloud SysAdmin", "DevSecOps Specialist"];

function generateSyntheticData() {
    const type = document.getElementById('gen-type').value;
    const out = document.getElementById('sandbox-output');
    let resultObj = {};
    if (type === "PERFIL_DEV" || type === "PERFIL_SYSADMIN") {
        const idx = Math.floor(Math.random() * NOMES_MOCK.length);
        const name = NOMES_MOCK[idx];
        const user = name.toLowerCase().replace(/\s/g, '.');
        resultObj = {
            status_massa: "SINTÉTICO_VÁLIDO",
            timestamp: new Date().toISOString(),
            identidade: {
                nome: name,
                cargo: type === "PERFIL_SYSADMIN" ? CARGOS_MOCK[2] : CARGOS_MOCK[0],
                cpf_legitimo: gerarCpfValido().replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
                rg_simulado: `${Math.floor(Math.random()*90000000 + 10000005)}-${Math.floor(Math.random()*9)}`
            },
            vinculos: {
                email: `${user}@ambiente-teste.internal`,
                chave_pix: `pix.${user}@sandbox.net`,
                cam_militar: `CAM-${Math.floor(Math.random()*9000000)}-${Math.floor(Math.random()*9)}`
            }
        };
    } else if (type === "DOCUMENTOS_LOTES") {
        resultObj = {
            descricao: "Massa de documentos puros gerados sob cálculo modular oficial para homologação e testes de código corporativo.",
            cpfs_validos: [gerarCpfValido(), gerarCpfValido(), gerarCpfValido()],
            cnpjs_validos: [gerarCnpjValido(), gerarCnpjValido(), gerarCnpjValido()]
        };
    }
    if(out) out.innerText = JSON.stringify(resultObj, null, 4);
}

function copyGeneratedToClipboard() {
    const text = document.getElementById('sandbox-output').innerText;
    navigator.clipboard.writeText(text).then(() => alert("JSON copiado para o clipboard com sucesso."));
}
