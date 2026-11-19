"use strict";

(() => {
  const executorForm = document.getElementById("executorForm");
  const pageUrl = document.getElementById("pageUrl");
  const frame = document.getElementById("executorFrame");
  const emptyState = document.getElementById("executorEmpty");
  const executorStatus = document.getElementById("executorStatus");
  const clearPage = document.getElementById("clearPage");
  const openExternal = document.getElementById("openExternal");
  const executorPanel = document.getElementById("executorPanel");
  const assistantPanel = document.getElementById("assistantPanel");
  const railItems = document.querySelectorAll("[data-workspace-tab]");
  const assistantLauncher = document.getElementById("assistantLauncher");
  const assistantPopup = document.getElementById("assistantPopup");
  const closeAssistant = document.getElementById("closeAssistant");
  const openAssistantSettings = document.getElementById("openAssistantSettings");
  const settingsTabs = document.querySelectorAll("[data-settings-tab]");
  const modelsSettings = document.getElementById("modelsSettings");
  const agentsSettings = document.getElementById("agentsSettings");

  function switchPanel(panel) {
    const assistantActive = panel === "assistant";
    executorPanel.hidden = assistantActive;
    assistantPanel.hidden = !assistantActive;
    railItems.forEach((item) => {
      const active = item.dataset.workspaceTab === panel;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", active ? "page" : "false");
    });
    history.replaceState(null, "", assistantActive ? "#ia-local" : "#executor");
  }

  function switchSettingsTab(tab) {
    const agentsActive = tab === "agents";
    modelsSettings.hidden = agentsActive;
    agentsSettings.hidden = !agentsActive;
    settingsTabs.forEach((item) => {
      const active = item.dataset.settingsTab === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
  }

  settingsTabs.forEach((tab) => tab.addEventListener("click", () => {
    switchSettingsTab(tab.dataset.settingsTab);
  }));
  document.querySelector('[role="tablist"]').addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextTab = event.key === "ArrowRight" ? "agents" : "models";
    switchSettingsTab(nextTab);
    document.querySelector(`[data-settings-tab="${nextTab}"]`).focus();
  });
  switchSettingsTab("models");

  railItems.forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    switchPanel(item.dataset.workspaceTab);
  }));
  switchPanel(location.hash === "#ia-local" ? "assistant" : "executor");

  function setPopupOpen(open) {
    assistantPopup.hidden = !open;
    assistantLauncher.setAttribute("aria-expanded", String(open));
    try {
      localStorage.setItem("dsbrti-assistant-open", String(open));
    } catch (error) {
      console.error("Não foi possível salvar o estado do assistente.", error);
    }
    if (open) {
      window.setTimeout(() => document.getElementById("agentSelect").focus(), 0);
    }
  }

  assistantLauncher.addEventListener("click", () => setPopupOpen(assistantPopup.hidden));
  closeAssistant.addEventListener("click", () => setPopupOpen(false));
  openAssistantSettings.addEventListener("click", () => {
    setPopupOpen(false);
    switchSettingsTab("models");
    switchPanel("assistant");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !assistantPopup.hidden) setPopupOpen(false);
  });
  try {
    setPopupOpen(localStorage.getItem("dsbrti-assistant-open") === "true");
  } catch (error) {
    console.error("Não foi possível recuperar o estado do assistente.", error);
    assistantPopup.hidden = true;
  }

  function isLocalHost(hostname) {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
    if (host === "localhost" || host.endsWith(".localhost") ||
        host.endsWith(".local") || host.endsWith(".internal") ||
        host === "::1" || host === "::" || host.startsWith("fc") ||
        host.startsWith("fd") || host.startsWith("fe80:") ||
        host.startsWith("::ffff:") || host === "0.0.0.0") return true;

    const octets = host.split(".").map(Number);
    if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return false;
    }
    return octets[0] === 10 ||
      octets[0] === 127 ||
      octets[0] === 0 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127);
  }

  executorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let target;
    try {
      target = new URL(pageUrl.value.trim());
    } catch {
      executorStatus.textContent = "Informe um endereço HTTPS válido.";
      return;
    }

    if (target.protocol !== "https:" || target.username || target.password) {
      executorStatus.textContent = "Por segurança, o executor aceita somente endereços HTTPS sem credenciais incorporadas.";
      return;
    }
    if (isLocalHost(target.hostname)) {
      executorStatus.textContent = "Endereços locais e de rede privada não podem ser abertos neste executor.";
      return;
    }

    frame.hidden = false;
    emptyState.hidden = true;
    frame.src = target.href;
    openExternal.href = target.href;
    openExternal.setAttribute("aria-disabled", "false");
    clearPage.disabled = false;
    executorStatus.textContent = "Página solicitada. Se o painel ficar vazio, o site pode bloquear iframes (CSP/X-Frame-Options). Abra fora do executor para continuar.";
  });

  clearPage.addEventListener("click", () => {
    frame.removeAttribute("src");
    frame.hidden = true;
    emptyState.hidden = false;
    openExternal.href = "#";
    openExternal.setAttribute("aria-disabled", "true");
    clearPage.disabled = true;
    executorStatus.textContent = "Página encerrada. O painel foi removido.";
  });

  const modelCatalog = [
    { id: "onnx-community/Qwen2.5-0.5B-Instruct", label: "Qwen 2.5 · 0,5B (aprox. 500 MB)" },
    { id: "onnx-community/SmolLM2-360M-Instruct", label: "SmolLM2 · 360M (aprox. 350 MB)" },
    { id: "onnx-community/Llama-3.2-1B-Instruct", label: "Llama 3.2 · 1B (aprox. 800 MB)" },
    { id: "onnx-community/Qwen2.5-1.5B-Instruct", label: "Qwen 2.5 · 1,5B (aprox. 1,2 GB)" }
  ];
  const consent = document.getElementById("modelConsent");
  const modelSelect = document.getElementById("modelSelect");
  const loadModelButton = document.getElementById("loadModel");
  const unloadModelButton = document.getElementById("unloadModel");
  const clearModelButton = document.getElementById("clearModel");
  const modelStatus = document.getElementById("modelStatus");
  const modelProgress = document.getElementById("modelProgress");
  const modelStorage = document.getElementById("modelStorage");
  const agentSelect = document.getElementById("agentSelect");
  const activeAgentDescription = document.getElementById("activeAgentDescription");
  const agentStatus = document.getElementById("agentStatus");
  const agentCount = document.getElementById("agentCount");
  const agentCatalog = document.getElementById("agentCatalog");
  const agentForm = document.getElementById("agentForm");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendMessage = document.getElementById("sendMessage");
  const clearConversation = document.getElementById("clearConversation");
  const cacheName = "transformers-cache";
  const conversationKey = "dsbrti-assistant-conversation";
  const customAgentsKey = "dsbrti-assistant-agents";
  let generator = null;
  let busy = false;
  let agents = [];
  let conversation = [];

  function updateChatAvailability() {
    const enabled = Boolean(generator && agentSelect.value) && !busy;
    chatInput.disabled = !enabled;
    sendMessage.disabled = !enabled;
  }

  function updateModelControls() {
    const loaded = Boolean(generator);
    loadModelButton.disabled = !consent.checked || loaded || busy;
    modelSelect.disabled = loaded || busy;
    unloadModelButton.disabled = !loaded || busy;
  }

  async function updateStorage() {
    if (!navigator.storage?.estimate) {
      modelStorage.textContent = "Este navegador não informa a cota de armazenamento.";
      return;
    }
    const { quota, usage } = await navigator.storage.estimate();
    if (Number.isFinite(quota) && Number.isFinite(usage)) {
      const availableMb = Math.max(0, quota - usage) / (1024 * 1024);
      modelStorage.textContent = `Espaço estimado disponível: ${Math.floor(availableMb)} MB. A cota pode mudar.`;
    }
  }

  updateStorage().catch((error) => {
    modelStorage.textContent = "Não foi possível consultar a cota de armazenamento.";
    console.error("Falha ao consultar o armazenamento do navegador.", error);
  });

  if ("caches" in window) {
    caches.has(cacheName).then((hasCache) => {
      clearModelButton.disabled = !hasCache;
      if (hasCache) {
        modelStatus.textContent = "Arquivos de modelo em cache encontrados. Autorize para carregar um modelo neste dispositivo.";
      }
    }).catch((error) => {
      modelStatus.textContent = "Não foi possível verificar o cache local do modelo.";
      console.error("Falha ao verificar o cache do modelo.", error);
    });
  } else {
    clearModelButton.disabled = true;
  }

  function saveCustomAgents() {
    try {
      localStorage.setItem(customAgentsKey, JSON.stringify(agents.filter((agent) => agent.custom)));
      agentStatus.textContent = "Agente salvo somente neste navegador.";
    } catch (error) {
      agentStatus.textContent = "Não foi possível salvar o agente neste navegador.";
      console.error("Falha ao salvar agente personalizado.", error);
    }
  }

  function readCustomAgents() {
    const stored = localStorage.getItem(customAgentsKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Formato de agentes personalizados inválido.");
    return parsed.filter((agent) =>
      agent && typeof agent.id === "string" &&
      typeof agent.name === "string" && agent.name.length <= 32 &&
      typeof agent.description === "string" && agent.description.length <= 120 &&
      typeof agent.instructions === "string" && agent.instructions.length <= 1200 &&
      agent.custom === true
    );
  }

  function renderAgentOptions(selectedId) {
    agentSelect.replaceChildren();
    agentCatalog.replaceChildren();
    agents.forEach((agent) => {
      const option = document.createElement("option");
      option.value = agent.id;
      option.textContent = agent.name;
      agentSelect.append(option);

      if (!agent.custom) {
        const item = document.createElement("li");
        item.className = "agent-catalog-item";
        const name = document.createElement("strong");
        name.textContent = agent.name;
        const description = document.createElement("span");
        description.textContent = agent.description;
        item.append(name, description);
        agentCatalog.append(item);
      }
    });
    const builtInCount = agents.filter((agent) => !agent.custom).length;
    const customCount = agents.filter((agent) => agent.custom).length;
    agentCount.textContent = `${builtInCount} oficiais${customCount ? ` · ${customCount} pessoais` : ""}`;
    if (selectedId && agents.some((agent) => agent.id === selectedId)) {
      agentSelect.value = selectedId;
    }
    agentSelect.disabled = agents.length === 0;
    updateActiveAgent();
    updateChatAvailability();
  }

  function updateActiveAgent() {
    const agent = agents.find((item) => item.id === agentSelect.value);
    activeAgentDescription.textContent = agent
      ? `${agent.name} · ${agent.description}`
      : "Nenhum agente disponível";
  }

  async function loadAgents() {
    try {
      const response = await fetch("/agentes/manifest.json");
      if (!response.ok) throw new Error(`O catálogo de agentes respondeu com HTTP ${response.status}.`);
      const catalog = await response.json();
      if (!Array.isArray(catalog) || catalog.some((agent) =>
        !agent || typeof agent.id !== "string" ||
        typeof agent.name !== "string" ||
        typeof agent.description !== "string" ||
        typeof agent.instructions !== "string"
      )) {
        throw new Error("O catálogo de agentes possui formato inválido.");
      }
      agents = catalog.map((agent) => ({ ...agent, custom: false }));
      try {
        agents.push(...readCustomAgents());
      } catch (error) {
        agentStatus.textContent = "Os agentes personalizados salvos não puderam ser lidos.";
        console.error("Falha ao recuperar agentes personalizados.", error);
      }
      let selectedAgent = "";
      try {
        selectedAgent = localStorage.getItem("dsbrti-assistant-agent") || "";
      } catch (error) {
        console.error("Falha ao recuperar a seleção de agente.", error);
      }
      renderAgentOptions(selectedAgent);
      agentStatus.textContent = `${catalog.length} agentes prontos. Agentes personalizados são salvos neste navegador.`;
    } catch (error) {
      agentSelect.replaceChildren();
      agentSelect.disabled = true;
      agentStatus.textContent = "Não foi possível carregar o catálogo de agentes.";
      modelStatus.textContent = "O assistente não pode iniciar sem carregar seu catálogo de agentes.";
      console.error("Falha ao carregar o catálogo de agentes.", error);
    }
  }

  agentSelect.addEventListener("change", () => {
    updateActiveAgent();
    updateChatAvailability();
    try {
      localStorage.setItem("dsbrti-assistant-agent", agentSelect.value);
    } catch (error) {
      agentStatus.textContent = "Não foi possível salvar a seleção de agente.";
      console.error("Falha ao salvar seleção de agente.", error);
    }
  });
  loadAgents();

  agentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(agentForm);
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const instructions = String(formData.get("instructions") || "").trim();
    if (!name || !description || !instructions) {
      agentStatus.textContent = "Preencha nome, função e instruções para criar o agente.";
      return;
    }

    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    agents.push({ id, name, description, instructions, custom: true });
    renderAgentOptions(id);
    saveCustomAgents();
    try {
      localStorage.setItem("dsbrti-assistant-agent", id);
    } catch (error) {
      agentStatus.textContent = "O agente foi criado, mas não foi possível salvar sua seleção.";
      console.error("Falha ao salvar a seleção de agente personalizado.", error);
    }
    agentForm.reset();
  });

  consent.addEventListener("change", updateModelControls);
  modelSelect.addEventListener("change", () => {
    consent.checked = false;
    updateModelControls();
    const model = modelCatalog.find((item) => item.id === modelSelect.value);
    if (model) modelStatus.textContent = `Modelo selecionado: ${model.label}. Autorize o download antes de preparar o modelo.`;
  });

  loadModelButton.addEventListener("click", async () => {
    if (!consent.checked || busy) return;
    if (!navigator.storage || !("caches" in window)) {
      modelStatus.textContent = "Este navegador não oferece o cache necessário para guardar o modelo localmente.";
      return;
    }

    const model = modelCatalog.find((item) => item.id === modelSelect.value);
    if (!model) {
      modelStatus.textContent = "Selecione um modelo válido no catálogo.";
      return;
    }

    busy = true;
    updateModelControls();
    updateChatAvailability();
    modelProgress.hidden = false;
    modelProgress.value = 0;
    modelStatus.textContent = "Carregando o runtime e verificando suporte ao dispositivo…";

    try {
      const { env, pipeline } = await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/+esm"
      );
      env.useBrowserCache = true;
      env.cacheKey = cacheName;
      env.allowRemoteModels = true;
      env.allowLocalModels = false;

      const adapter = navigator.gpu ? await navigator.gpu.requestAdapter() : null;
      const device = adapter ? "webgpu" : "wasm";
      const dtype = adapter ? "q4f16" : "q8";
      modelStatus.textContent = `Preparando ${model.label} ${device === "webgpu" ? "com WebGPU" : "em modo CPU"}. O primeiro download pode ser grande.`;

      generator = await pipeline("text-generation", model.id, {
        device,
        dtype,
        progress_callback(progress) {
          if (Number.isFinite(progress?.progress)) {
            modelProgress.value = Math.max(0, Math.min(100, progress.progress));
          }
          if (progress?.status === "progress" && progress.file) {
            modelStatus.textContent = `Baixando ${progress.file}… ${Math.round(progress.progress || 0)}%.`;
          } else if (progress?.status === "done" && progress.file) {
            modelStatus.textContent = `Arquivo preparado: ${progress.file}.`;
          }
        }
      });

      modelProgress.value = 100;
      modelStatus.textContent = `Modelo pronto: ${model.label}. A conversa fica salva localmente neste navegador.`;
      clearModelButton.disabled = false;
    } catch (error) {
      generator = null;
      modelStatus.textContent = `Não foi possível carregar o modelo: ${error.message || "erro desconhecido"}. Verifique compatibilidade, conexão e cota de armazenamento.`;
      console.error("Falha ao carregar o modelo local.", error);
    } finally {
      busy = false;
      updateModelControls();
      updateChatAvailability();
      updateStorage().catch((error) => console.error("Falha ao atualizar a cota de armazenamento.", error));
    }
  });

  unloadModelButton.addEventListener("click", () => {
    if (busy || !generator) return;
    generator = null;
    modelStatus.textContent = "Modelo liberado da sessão. Selecione outro modelo ou carregue novamente o escolhido.";
    modelProgress.hidden = true;
    updateModelControls();
    updateChatAvailability();
  });

  clearModelButton.addEventListener("click", async () => {
    if (busy) return;
    const confirmed = window.confirm("Apagar o cache de modelos Transformers deste site? Isso pode remover outros modelos locais armazenados aqui.");
    if (!confirmed) return;
    try {
      generator = null;
      updateModelControls();
      updateChatAvailability();
      const removed = await caches.delete(cacheName);
      modelStatus.textContent = removed
        ? "Cache local de modelos removido."
        : "Nenhum cache de modelo foi encontrado.";
      modelProgress.value = 0;
      modelProgress.hidden = true;
      clearModelButton.disabled = true;
      await updateStorage();
    } catch (error) {
      modelStatus.textContent = "Não foi possível apagar o cache de modelos.";
      console.error("Falha ao remover o cache do modelo.", error);
    }
  });

  function persistConversation() {
    try {
      localStorage.setItem(conversationKey, JSON.stringify(conversation.slice(-100)));
    } catch (error) {
      modelStatus.textContent = "Não foi possível salvar o histórico local da conversa.";
      console.error("Falha ao persistir a conversa local.", error);
    }
  }

  function addMessage(role, text, agentId) {
    const placeholder = chatMessages.querySelector(".chat-placeholder");
    if (placeholder) placeholder.remove();
    const message = document.createElement("p");
    message.className = `chat-message ${role}`;
    message.textContent = text;
    chatMessages.append(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    conversation.push({ role, text, agentId, timestamp: Date.now() });
    conversation = conversation.slice(-100);
    persistConversation();
  }

  function restoreConversation() {
    try {
      const stored = localStorage.getItem(conversationKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) throw new Error("Formato do histórico local inválido.");
      conversation = parsed.filter((message) =>
        message && (message.role === "user" || message.role === "assistant") &&
        typeof message.text === "string" && message.text.length <= 10000 &&
        typeof message.agentId === "string"
      ).slice(-100);
      conversation.forEach((message) => {
        const element = document.createElement("p");
        element.className = `chat-message ${message.role}`;
        element.textContent = message.text;
        chatMessages.append(element);
      });
      if (conversation.length) {
        chatMessages.querySelector(".chat-placeholder")?.remove();
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } catch (error) {
      modelStatus.textContent = "O histórico local não pôde ser recuperado.";
      console.error("Falha ao recuperar o histórico local.", error);
    }
  }

  restoreConversation();

  clearConversation.addEventListener("click", () => {
    if (!conversation.length) return;
    if (!window.confirm("Limpar as mensagens salvas neste navegador?")) return;
    conversation = [];
    chatMessages.replaceChildren();
    const placeholder = document.createElement("p");
    placeholder.className = "chat-placeholder";
    placeholder.textContent = generator
      ? "Conversa limpa. Envie uma mensagem para começar."
      : "Prepare um modelo no painel de IA para iniciar. As conversas ficam neste navegador.";
    chatMessages.append(placeholder);
    persistConversation();
  });

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = chatInput.value.trim();
    const agent = agents.find((item) => item.id === agentSelect.value);
    if (!prompt || !generator || !agent || busy) return;

    busy = true;
    chatInput.value = "";
    updateModelControls();
    updateChatAvailability();
    addMessage("user", prompt, agent.id);

    try {
      const priorMessages = conversation
        .filter((message) => message.agentId === agent.id)
        .slice(-10)
        .map((message) => ({ role: message.role, content: message.text }));
      const output = await generator(
        [{ role: "system", content: agent.instructions }, ...priorMessages],
        { max_new_tokens: 192, do_sample: false }
      );
      const generated = output?.[0]?.generated_text;
      const answer = Array.isArray(generated)
        ? generated[generated.length - 1]?.content
        : generated;
      addMessage("assistant", String(answer || "O modelo não retornou uma resposta."), agent.id);
    } catch (error) {
      addMessage("assistant", "Não foi possível gerar uma resposta local. Tente novamente.", agent.id);
      console.error("Falha na inferência local.", error);
    } finally {
      busy = false;
      updateModelControls();
      updateChatAvailability();
      chatInput.focus();
    }
  });

  clearModelButton.disabled = true;
  updateModelControls();
  updateChatAvailability();
})();
