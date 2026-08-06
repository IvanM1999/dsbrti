/* ==========================================================================
   1. INICIALIZAÇÃO DO EDITOR CODEMIRROR
   ========================================================================== */
const codigoInicial = `#include <iostream>

void resolverLabirinto() {
    // Escreva sua lógica usando mover('D'), mover('S'), mover('A'), mover('W')
    
    for(int i = 0; i < 4; i++) {
        mover('D');
    }
    for(int i = 0; i < 4; i++) {
        mover('S');
    }
}
`;

const editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
    mode: 'text/x-c++src',
    theme: 'dracula',
    lineNumbers: true,
    tabSize: 4,
    autoCloseBrackets: true
});
editor.setValue(codigoInicial);

// Evento de auto validação de sintaxe se ativado
editor.on('change', () => {
    const autoCheckInput = document.getElementById('settingAutoCheck');
    if (autoCheckInput && autoCheckInput.checked) {
        verificarSintaxeSilenciosa();
    }
});

/* ==========================================================================
   2. RECURSOS DO TECLADO HACKER & INTELIGÊNCIA DE SINTAXE
   ========================================================================== */

function toggleHackerKeyboard() {
    const kb = document.getElementById('hackerKeyboard');
    const btn = document.getElementById('toggleKbNavBtn');
    kb.classList.toggle('hidden');
    const isHidden = kb.classList.contains('hidden');
    
    const kbSetting = document.getElementById('settingKbToggle');
    if (kbSetting) kbSetting.checked = !isHidden;
    
    if (isHidden) {
        btn.classList.remove('active');
    } else {
        btn.classList.add('active');
    }
    setTimeout(() => editor.refresh(), 100);
}

function toggleHackerKeyboardSetting(checked) {
    const kb = document.getElementById('hackerKeyboard');
    const btn = document.getElementById('toggleKbNavBtn');
    if (!checked) {
        kb.classList.add('hidden');
        btn.classList.remove('active');
    } else {
        kb.classList.remove('hidden');
        btn.classList.add('active');
    }
    setTimeout(() => editor.refresh(), 100);
}

// Inserir texto simples na posição atual do cursor
function inserirTexto(texto) {
    const doc = editor.getDoc();
    const cursor = doc.getCursor();
    doc.replaceRange(texto, cursor);
    editor.focus();
}

// Inserir Par de Caracteres Abertura/Fechamento juntos e posicionar cursor no meio
function inserirPar(abertura, fechamento) {
    const doc = editor.getDoc();
    const cursor = doc.getCursor();
    const selecao = doc.getSelection();

    if (selecao.length > 0) {
        doc.replaceSelection(abertura + selecao + fechamento);
    } else {
        doc.replaceRange(abertura + fechamento, cursor);
        doc.setCursor({ line: cursor.line, ch: cursor.ch + abertura.length });
    }
    editor.focus();
}

// Inserção de Snippets Estruturados (for loop, if block)
function inserirSnippet(tipo) {
    const doc = editor.getDoc();
    const cursor = doc.getCursor();
    let snippet = '';
    let offsetLine = 0;
    let offsetCh = 0;

    if (tipo === 'for') {
        snippet = 'for (int i = 0; i < 4; i++) {\n    \n}';
        offsetLine = 1;
        offsetCh = 4;
    } else if (tipo === 'if') {
        snippet = 'if () {\n    \n}';
        offsetLine = 0;
        offsetCh = 4;
    }

    doc.replaceRange(snippet, cursor);
    doc.setCursor({ line: cursor.line + offsetLine, ch: offsetCh });
    editor.focus();
}

// Inteligência de Sintaxe: Verifica aspas e delimitadores abertos
function verificarSintaxeInteligente() {
    const code = editor.getValue();
    const erro = analisarSintaxeCode(code);

    const alertBox = document.getElementById('syntaxAlert');
    const alertMsg = document.getElementById('syntaxAlertMsg');

    if (erro) {
        alertBox.className = "syntax-check-box error";
        alertMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>Atenção:</strong> ${erro}`;
        alertBox.style.display = "flex";
    } else {
        alertBox.className = "syntax-check-box success";
        alertMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Perfeito:</strong> Nenhuma pendência de parênteses, chaves ou aspas abertas!`;
        alertBox.style.display = "flex";
    }
}

function verificarSintaxeSilenciosa() {
    const code = editor.getValue();
    const erro = analisarSintaxeCode(code);
    const alertBox = document.getElementById('syntaxAlert');
    const alertMsg = document.getElementById('syntaxAlertMsg');

    if (erro) {
        alertBox.className = "syntax-check-box error";
        alertMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>Atenção:</strong> ${erro}`;
        alertBox.style.display = "flex";
    } else {
        alertBox.style.display = "none";
    }
}

function fecharAlertaSintaxe() {
    document.getElementById('syntaxAlert').style.display = "none";
}

function analisarSintaxeCode(code) {
    const stack = [];
    let inStringDouble = false;
    let inStringSingle = false;
    let lineNum = 1;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];

        if (char === '\n') lineNum++;

        // Checar Strings
        if (char === '"' && !inStringSingle) {
            inStringDouble = !inStringDouble;
            continue;
        }
        if (char === "'" && !inStringDouble) {
            inStringSingle = !inStringSingle;
            continue;
        }

        if (inStringDouble || inStringSingle) continue;

        // Empilha delimitadores
        if (char === '(' || char === '{' || char === '[') {
            stack.push({ char, line: lineNum });
        } else if (char === ')' || char === '}' || char === ']') {
            if (stack.length === 0) {
                return `Caractere de fechamento '${char}' sem correspondente de abertura na linha ${lineNum}.`;
            }
            const topo = stack.pop();
            if (
                (char === ')' && topo.char !== '(') ||
                (char === '}' && topo.char !== '{') ||
                (char === ']' && topo.char !== '[')
            ) {
                return `Incompatibilidade de fechamento '${char}' para '${topo.char}' aberto na linha ${topo.line}.`;
            }
        }
    }

    if (inStringDouble) return `Há uma String com aspas duplas ("...") não fechada no seu código.`;
    if (inStringSingle) return `Há um caractere com aspas simples ('...') não fechado no seu código.`;

    if (stack.length > 0) {
        const topo = stack.pop();
        return `O bloco '${topo.char}' aberto na linha ${topo.line} não foi fechado!`;
    }

    return null;
}

/* ==========================================================================
   3. DICIONÁRIO DE TERMOS & ABAS (CARREGAMENTO VIA JSON EXTERNO)
   ========================================================================== */
let termosDicionario = [];

async function carregarDicionario() {
    const list = document.getElementById('dictList');
    if (!list) return;

    try {
        const response = await fetch('dicionario.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        termosDicionario = await response.json();
        renderizarDicionario(termosDicionario);
    } catch (err) {
        console.error('Erro ao carregar o dicionário externo:', err);
        list.innerHTML = `<p style="color: var(--danger); font-size: 12px; padding: 8px;">Erro ao carregar termos do dicionário.</p>`;
    }
}

function renderizarDicionario(itens) {
    const list = document.getElementById('dictList');
    if (!list) return;

    if (itens.length === 0) {
        list.innerHTML = `<p style="color: var(--text-sub); font-size: 12px; padding: 8px;">Nenhum termo encontrado.</p>`;
        return;
    }

    list.innerHTML = itens.map(t => `
        <div class="dict-item">
            <h4><i class="fa-solid fa-code"></i> ${t.termo}</h4>
            <p>${t.def}</p>
        </div>
    `).join('');
}

function filtrarDicionario() {
    const q = document.getElementById('dictSearch').value.toLowerCase();
    const filtrados = termosDicionario.filter(t => 
        t.termo.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
    );
    renderizarDicionario(filtrados);
}

function switchTab(tabName) {
    document.querySelectorAll('.tabs-header .tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-curso').style.display = 'none';
    document.getElementById('tab-dicionario').style.display = 'none';

    if (tabName === 'curso') {
        document.querySelectorAll('.tabs-header .tab-btn')[0].classList.add('active');
        document.getElementById('tab-curso').style.display = 'block';
    } else {
        document.querySelectorAll('.tabs-header .tab-btn')[1].classList.add('active');
        document.getElementById('tab-dicionario').style.display = 'block';
    }
}

// Inicializa a busca externa ao carregar a página
carregarDicionario();

/* ==========================================================================
   4. SIMULADOR DO LABIRINTO (ENGINE CANVAS 5x5)
   ========================================================================== */
const canvas = document.getElementById('canvasLabirinto');
const ctx = canvas.getContext('2d');
const GRID = 5;
const CELL = canvas.width / GRID;

const mapaOriginal = [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 3]
];

let player = { x: 0, y: 0 };
let pontos = 100;

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            if (mapaOriginal[r][c] === 1) {
                ctx.fillStyle = '#313244';
                ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
            } else if (mapaOriginal[r][c] === 3) {
                ctx.fillStyle = '#a6e3a1';
                ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
            } else {
                ctx.fillStyle = '#11111b';
                ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
            }
        }
    }
    // Desenhar Jogador (Bolinha)
    ctx.fillStyle = '#89b4fa';
    ctx.beginPath();
    ctx.arc(player.x * CELL + CELL / 2, player.y * CELL + CELL / 2, CELL / 3, 0, Math.PI * 2);
    ctx.fill();
}
desenhar();

async function compilarEExecutar() {
    player = { x: 0, y: 0 };
    pontos = 100;
    document.getElementById('hudPontos').innerText = pontos;
    document.getElementById('hudStatus').innerText = "Executando...";
    document.getElementById('hudStatus').className = "hud-value status-running";
    desenhar();

    const code = editor.getValue();
    const linhas = code.split('\n');
    const comandos = [];

    linhas.forEach(linha => {
        const matchMover = linha.match(/mover\s*\(\s*['"]([WASDwasd])['"]\s*\)/);
        const matchFor = linha.match(/for\s*\(\s*int\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*(\d+)/);
        
        if (matchFor) {
            const repeticoes = parseInt(matchFor[1]);
            const idx = linhas.indexOf(linha);
            if (linhas[idx+1] && linhas[idx+1].includes('mover')) {
                const subMatch = linhas[idx+1].match(/mover\s*\(\s*['"]([WASDwasd])['"]\s*\)/);
                if (subMatch) {
                    for (let i = 0; i < repeticoes; i++) comandos.push(subMatch[1].toUpperCase());
                }
            }
        } else if (matchMover && !linha.includes('for')) {
            comandos.push(matchMover[1].toUpperCase());
        }
    });

    for (let cmd of comandos) {
        await new Promise(r => setTimeout(r, 250));
        let nx = player.x;
        let ny = player.y;

        if (cmd === 'D') nx++;
        if (cmd === 'A') nx--;
        if (cmd === 'S') ny++;
        if (cmd === 'W') ny--;

        if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID && mapaOriginal[ny][nx] !== 1) {
            player.x = nx;
            player.y = ny;
            pontos -= 2;
        } else {
            pontos -= 10;
            document.getElementById('hudStatus').innerText = "Colisão!";
            document.getElementById('hudStatus').className = "hud-value status-error";
        }
        document.getElementById('hudPontos').innerText = Math.max(0, pontos);
        desenhar();
    }

    if (mapaOriginal[player.y][player.x] === 3) {
        document.getElementById('hudStatus').innerText = "Vitória!";
        document.getElementById('hudStatus').className = "hud-value status-ready";
    } else if (!document.getElementById('hudStatus').innerText.includes("Colisão")) {
        document.getElementById('hudStatus').innerText = "Incompleto";
        document.getElementById('hudStatus').className = "hud-value";
    }
}

/* ==========================================================================
   5. IA CHAT PÚBLICA & CONTROLE DO BALÃO FLUTUANTE
   ========================================================================== */
function toggleAIChat() {
    const bubble = document.getElementById('aiChatBubble');
    if (!bubble) return;
    
    bubble.classList.toggle('hidden');
    
    if (!bubble.classList.contains('hidden')) {
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 100);
    }
}

const systemPrompt = `Você é um tutor de programação C++ e lógica. 
REGRA DE OURO IMPRESCINDÍVEL: NUNCA forneça o código pronto ou a resposta exata para o usuário. 
Sua função é dar dicas conceituais, explicar onde estão os erros lógicos e guiar a linha de raciocínio do estudante.`;

async function chamarIAPublica(mensagens) {
    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'system', content: systemPrompt }, ...mensagens],
                model: 'openai'
            })
        });
        return await response.text();
    } catch (err) {
        return "Erro ao conectar com a IA. Verifique sua conexão.";
    }
}

function adicionarMensagemChat(texto, sender) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}`;
    msgDiv.innerText = texto;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function enviarMsgChat() {
    const input = document.getElementById('chatInput');
    const texto = input.value.trim();
    if (!texto) return;

    adicionarMensagemChat(texto, 'user');
    input.value = '';

    const carregandoDiv = document.createElement('div');
    carregandoDiv.className = 'msg ai';
    carregandoDiv.innerText = "Pensando...";
    document.getElementById('chatBox').appendChild(carregandoDiv);

    const repostaIA = await chamarIAPublica([{ role: 'user', content: texto }]);
    carregandoDiv.remove();
    
    adicionarMensagemChat(repostaIA, 'ai');
}

async function analisarCodigoComIA() {
    // Garante que o balão está aberto ao analisar
    const bubble = document.getElementById('aiChatBubble');
    if (bubble && bubble.classList.contains('hidden')) {
        toggleAIChat();
    }

    const codigoAtual = editor.getValue();
    adicionarMensagemChat("Analise meu código na IDE e me dê orientações.", 'user');

    const carregandoDiv = document.createElement('div');
    carregandoDiv.className = 'msg ai';
    carregandoDiv.innerText = "Analisando IDE...";
    document.getElementById('chatBox').appendChild(carregandoDiv);

    const promptAnalise = `Analise o seguinte código C++ e diga onde o usuário pode melhorar sem dar a resposta pronta:

\`\`\`cpp
${codigoAtual}
\`\`\``;

    const repostaIA = await chamarIAPublica([{ role: 'user', content: promptAnalise }]);
    carregandoDiv.remove();
    
    adicionarMensagemChat(repostaIA, 'ai');
}

/* Modals */
function abrirConfiguracoes() {
    document.getElementById('modalSettings').style.display = 'flex';
}
function fecharConfiguracoes() {
    document.getElementById('modalSettings').style.display = 'none';
}
