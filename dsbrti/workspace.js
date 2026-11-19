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

  railItems.forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    switchPanel(item.dataset.workspaceTab);
  }));
  switchPanel(location.hash === "#ia-local" ? "assistant" : "executor");

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

  const consent = document.getElementById("modelConsent");
  const loadModelButton = document.getElementById("loadModel");
  const clearModelButton = document.getElementById("clearModel");
  const modelStatus = document.getElementById("modelStatus");
  const modelProgress = document.getElementById("modelProgress");
  const modelStorage = document.getElementById("modelStorage");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendMessage = document.getElementById("sendMessage");
  const cacheName = "transformers-cache";
  const modelId = "onnx-community/Qwen2.5-0.5B-Instruct";
  let generator = null;
  let busy = false;

  consent.addEventListener("change", () => {
    loadModelButton.disabled = !consent.checked || Boolean(generator) || busy;
  });

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
        modelStatus.textContent = "Arquivos de modelo em cache encontrados. Autorize para carregá-los no dispositivo.";
      }
    }).catch((error) => {
      modelStatus.textContent = "Não foi possível verificar o cache local do modelo.";
      console.error("Falha ao verificar o cache do modelo.", error);
    });
  }

  loadModelButton.addEventListener("click", async () => {
    if (!consent.checked || busy) return;
    if (!navigator.storage || !("caches" in window)) {
      modelStatus.textContent = "Este navegador não oferece o cache necessário para guardar o modelo localmente.";
      return;
    }

    busy = true;
    loadModelButton.disabled = true;
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
      modelStatus.textContent = `Preparando modelo ${device === "webgpu" ? "com WebGPU" : "em modo CPU"}; pode levar alguns minutos e usar mais de 500 MB.`;

      generator = await pipeline("text-generation", modelId, {
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
      modelStatus.textContent = "Modelo carregado. As mensagens desta conversa ficam somente na memória desta página.";
      chatInput.disabled = false;
      sendMessage.disabled = false;
      clearModelButton.disabled = false;
    } catch (error) {
      generator = null;
      modelStatus.textContent = `Não foi possível carregar o modelo: ${error.message || "erro desconhecido"}. Verifique WebGPU, conexão e cota de armazenamento; nenhum servidor de IA foi acionado.`;
      console.error("Falha ao carregar o modelo local.", error);
    } finally {
      busy = false;
      loadModelButton.disabled = !consent.checked || Boolean(generator);
      updateStorage().catch((error) => console.error("Falha ao atualizar a cota de armazenamento.", error));
    }
  });

  clearModelButton.addEventListener("click", async () => {
    if (busy) return;
    const confirmed = window.confirm("Apagar o cache de modelos Transformers deste site? Isso pode remover outros modelos locais armazenados aqui.");
    if (!confirmed) return;
    try {
      generator = null;
      chatInput.disabled = true;
      sendMessage.disabled = true;
      clearModelButton.disabled = true;
      const removed = await caches.delete(cacheName);
      modelStatus.textContent = removed
        ? "Cache local de modelos removido."
        : "Nenhum cache de modelo foi encontrado.";
      modelProgress.value = 0;
      modelProgress.hidden = true;
      loadModelButton.disabled = !consent.checked;
      await updateStorage();
    } catch (error) {
      modelStatus.textContent = "Não foi possível apagar o cache de modelos.";
      console.error("Falha ao remover o cache do modelo.", error);
    }
  });

  function addMessage(role, text) {
    const placeholder = chatMessages.querySelector(".chat-placeholder");
    if (placeholder) placeholder.remove();
    const message = document.createElement("p");
    message.className = `chat-message ${role}`;
    message.textContent = text;
    chatMessages.append(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const prompt = chatInput.value.trim();
    if (!prompt || !generator || busy) return;

    busy = true;
    chatInput.value = "";
    chatInput.disabled = true;
    sendMessage.disabled = true;
    addMessage("user", prompt);

    try {
      const output = await generator(
        [{ role: "user", content: prompt }],
        { max_new_tokens: 192, do_sample: false }
      );
      const generated = output?.[0]?.generated_text;
      const answer = Array.isArray(generated)
        ? generated[generated.length - 1]?.content
        : generated;
      addMessage("assistant", String(answer || "O modelo não retornou uma resposta."));
    } catch (error) {
      addMessage("assistant", "Não foi possível gerar uma resposta local. Tente novamente.");
      console.error("Falha na inferência local.", error);
    } finally {
      busy = false;
      chatInput.disabled = !generator;
      sendMessage.disabled = !generator;
      chatInput.focus();
    }
  });

  clearModelButton.disabled = true;
})();
