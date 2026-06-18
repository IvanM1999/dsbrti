const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const qtyInput = document.getElementById('qty');
const budgetInput = document.getElementById('budget');
const totalEl = document.getElementById('total');
const alertaEl = document.getElementById('alerta');
const listEl = document.getElementById('list');
const remainingEl = document.getElementById('remaining');

// Carrega os itens salvos e o último orçamento definido
let items = JSON.parse(localStorage.getItem('items_simple')) || [];
if (budgetInput) {
  budgetInput.value = localStorage.getItem('budget_simple') || '';
}

function addItem(){
  if(!nameInput.value.trim()) return;

  const item = {
    name: nameInput.value.trim(),
    price: parseFloat(priceInput.value) || 0,
    qty: parseFloat(qtyInput.value) || 1,
    active: true, // Inicia ativado (calculando no total)
    selected: false
  };

  items.push(item);
  save();

  nameInput.value = '';
  priceInput.value = '';
  qtyInput.value = '';

  render();
}

function render(){
  listEl.innerHTML = '';

  if(items.length === 0){
    listEl.innerHTML = '<div class="empty-state">Nenhum item adicionado ainda</div>';
    calc();
    return;
  }

  items.forEach((i, index) => {
    const div = document.createElement('div');
    div.className = 'item ' + (i.active ? 'active' : '');

    const deleteBtn = i.selected ? '<button class="btn btn-danger" onclick="removeItem(' + index + ')">Excluir</button>' : '';

    div.innerHTML = 
      '<div class="left">' +
        '<input type="checkbox" ' + (i.selected ? 'checked' : '') + ' onchange="selectItem(' + index + ')">' +
        '<span onclick="toggle(' + index + ')">' + i.name + ' - R$ ' + (i.price * i.qty).toFixed(2) + '</span>' +
      '</div>' +
      '<div>' + deleteBtn + '</div>';

    listEl.appendChild(div);
  });

  calc();
}

function toggle(i){
  items[i].active = !items[i].active;
  save();
  render();
}

function selectItem(i){
  items[i].selected = !items[i].selected;
  save();
  render();
}

function removeItem(i){
  items.splice(i, 1);
  save();
  render();
}

function calc(){
  let total = 0;
  items.forEach(i => {
    if(i.active) total += i.price * i.qty;
  });

  const budgetVal = parseFloat(budgetInput.value) || 0;
  const remaining = budgetVal - total;

  if (totalEl) totalEl.innerText = total.toFixed(2);
  if (remainingEl) remainingEl.innerText = 'R$ ' + remaining.toFixed(2);

  if(total > budgetVal && budgetVal > 0){
    alertaEl.innerText = 'Ultrapassou o orçamento!';
    alertaEl.classList.add('visible');
  } else {
    alertaEl.innerText = '';
    alertaEl.remove('visible');
  }
}

function save(){
  localStorage.setItem('items_simple', JSON.stringify(items));
  if (budgetInput) {
    localStorage.setItem('budget_simple', budgetInput.value);
  }
}

if (budgetInput) {
  budgetInput.addEventListener('input', () => {
    save();
    calc();
  });
}

// ==========================================
//  SISTEMA DE SINCRONIZAÇÃO INTELIGENTE MÃO DUPLA
// ==========================================

function exportarLista() {
  if (items.length === 0) {
    alert("Sua lista está vazia!");
    return;
  }
  
  const dados = {
    lista: items,
    orcamento: budgetInput.value
  };

  try {
    const stringDados = JSON.stringify(dados);
    // Codificação estável para caracteres especiais e acentos
    const hashBase64 = btoa(unescape(encodeURIComponent(stringDados)));
    const hashSeguro = encodeURIComponent(hashBase64);
    
    // Captura o domínio atual dinamicamente (não importa se mudar o domínio ou pasta)
    const urlFinal = window.location.origin + window.location.pathname + '?sync=' + hashSeguro;
    
    navigator.clipboard.writeText(urlFinal).then(() => {
      alert("Link atualizado copiado! Envie para o outro dispositivo sincronizar.");
    }).catch(() => {
      prompt("Cópia automática bloqueada. Copie manualmente o link abaixo:", urlFinal);
    });
  } catch (erro) {
    alert("Falha ao compactar os dados da lista.");
    console.error(erro);
  }
}

function verificarImportacao() {
  const urlParams = new URLSearchParams(window.location.search);
  const syncHash = urlParams.get('sync');
  
  if (syncHash) {
    let dadosImportados = null;

    // Tentativa 1: Decodificação avançada UTF-8
    try {
      const stringDados = decodeURIComponent(escape(atob(syncHash)));
      dadosImportados = JSON.parse(stringDados);
    } catch (e1) {
      // Tentativa 2: Fallback para formato Base64 tradicional
      try {
        const stringDadosAlternativa = decodeURIComponent(atob(syncHash));
        dadosImportados = JSON.parse(stringDadosAlternativa);
      } catch (e2) {
        console.error("Erro crítico na decodificação dos parâmetros da URL:", e2);
      }
    }
    
    // Se conseguimos decodificar a estrutura com sucesso
    if (dadosImportados && Array.isArray(dadosImportados.lista)) {
      if (confirm("Deseja sincronizar e mesclar as alterações feitas no outro dispositivo?")) {
        
        if (dadosImportados.orcamento) {
          budgetInput.value = dadosImportados.orcamento;
        }
        
        if (items.length === 0) {
          items = dadosImportados.lista;
        } else {
          // FUSÃO INTELIGENTE MÃO DUPLA:
          dadosImportados.lista.forEach(itemImportado => {
            const indexExistente = items.findIndex(i => i.name.toLowerCase() === itemImportado.name.toLowerCase());
            
            if (indexExistente !== -1) {
              // Item comum: Atualiza o status atual (ativo/inativo, valor, quantidade)
              items[indexExistente].active = itemImportado.active;
              items[indexExistente].price = itemImportado.price;
              items[indexExistente].qty = itemImportado.qty;
            } else {
              // Item novo: Insere na lista local
              items.push(itemImportado);
            }
          });

          // Filtra itens deletados no outro dispositivo
          items = items.filter(itemLocal => {
            const existiaNoEnvio = dadosImportados.lista.some(i => i.name.toLowerCase() === itemLocal.name.toLowerCase());
            if (existiaNoEnvio) {
              return dadosImportados.lista.some(i => i.name.toLowerCase() === itemLocal.name.toLowerCase());
            }
            return true; 
          });
        }
        
        save();
        alert("Lista sincronizada com sucesso!");
      }
    } else {
      alert("Link de sincronização inválido ou corrompido.");
    }

    // REDIRECIONAMENTO INTELIGENTE:
    // Redireciona o navegador para a URL Pai limpa (sem o '?sync=...')
    // window.location.origin pega o protocolo+domínio (ex: https://ivanmontibeller.onrender.com)
    // window.location.pathname pega as subpastas corretas (ex: /portifolio/shopping-list/index.html)
    window.location.href = window.location.origin + window.location.pathname;
  }
}

// Inicialização automática do aplicativo
verificarImportacao();
render();
