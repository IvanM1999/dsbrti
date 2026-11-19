"use strict";

(() => {
  const icons = {
    link: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.72"/>',
    settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1L13 7.5h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z"/>',
    window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>',
    zap: '<path d="m13 2-3 8h7l-6 12 1-9H6l7-11Z"/>',
    leaf: '<path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 9-6 8-16Z"/><path d="M4 21c2-5 5-8 11-11"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 4.5-2 4.5s3.2-.5 4.5-2c.7-.8.7-2 0-2.7a2 2 0 0 0-2.5.2Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.5C14.3 3.8 20 3 20 3s-.8 5.7-5.5 9A22 22 0 0 1 11 14Z"/><path d="M9 12H5l-2 3h5m3 0v4l3 2 2-6"/>',
    gamepad: '<path d="M6 12h4m-2-2v4"/><path d="M15 11h.01M18 13h.01"/><path d="M7 7h10a5 5 0 0 1 4.8 6.4l-1.2 4a2 2 0 0 1-3.3 1l-2.1-2H8.8l-2.1 2a2 2 0 0 1-3.3-1l-1.2-4A5 5 0 0 1 7 7Z"/>',
    ruler: '<path d="m21.3 8.7-6-6a1 1 0 0 0-1.4 0l-11 11a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0l11-11a1 1 0 0 0 0-1.4Z"/><path d="m7.5 10.5 2 2m1-5 2 2m1-5 2 2m-5 9 2 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.7-3.1 1.8 1.8 0 0 1 1.5-2.9H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z"/><path d="M7.5 10h.01M11 7h.01M15 8h.01"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    magnet: '<path d="M6 4v9a6 6 0 0 0 12 0V4"/><path d="M6 8h4m4 0h4"/>',
    brain: '<path d="M12 18V5"/><path d="M15 13a4.2 4.2 0 0 0 0-8 5 5 0 0 0-9 2 4 4 0 0 0 0 8 3.5 3.5 0 0 0 6 3"/><path d="M12 9a3 3 0 0 0-3-3m3 8a3 3 0 0 1-3 3m3-5a3 3 0 0 0 3 3"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    package: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v8l9 5 9-5V8m-9 5v8"/>',
    plug: '<path d="M12 22v-5m-5-5V7m10 5V7"/><path d="M5 7h14v4a7 7 0 0 1-14 0V7Z"/><path d="M9 3v4m6-4v4"/>',
    graduation: '<path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3.5 3 8.5 3 12 0v-5m4-2v6"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18m-11 0v2h4v-2"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>',
    laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20l-1-4H3l-1 4Z"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15m6-12v15"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    pen: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l0 5Z"/>',
    sparkles: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14ZM5 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"/>',
    scale: '<path d="m16 16 3-8 3 8a5 5 0 0 1-6 0ZM2 16l3-8 3 8a5 5 0 0 1-6 0ZM12 3v17m-5 1h10m-9-13 4-3 4 3"/>',
    warning: '<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    puzzle: '<path d="M19 13h-2a2 2 0 1 1-4 0v-2h-2a2 2 0 1 1-4 0V9H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6ZM13 3h6v6h-2a2 2 0 1 1-4 0h-2V5a2 2 0 0 1 2-2Z"/>',
    bulb: '<path d="M9 18h6m-5 4h4m-2-20a7 7 0 0 0-4 12.7c.8.6 1 1.2 1 2.3h6c0-1.1.2-1.7 1-2.3A7 7 0 0 0 12 2Z"/>',
    inbox: '<path d="M4 4h16l2 11v5H2v-5L4 4Z"/><path d="M2 14h6l2 3h4l2-3h6"/>',
    arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5v-13Z"/><path d="M4 16h16M8 6h8m-8 4h8"/>',
    monitor: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
    signal: '<path d="M2 20h.01M7 20v-4m5 4v-8m5 8V8m5 12V4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1m-5 6v-3h4v3"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.8 6.4-6.4 2.8 2.8-6.4 6.4-2.8Z"/>',
    medal: '<circle cx="12" cy="8" r="6"/><path d="m8.2 13-1.2 9 5-3 5 3-1.2-9"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    microscope: '<path d="m6 18 6-6 4 4-6 6H6v-4Zm9-8 3-3 3 3-3 3m-7-5 3-3 4 4m-9 9a7 7 0 0 0 13 0M5 22h15"/>',
    heart: '<path d="M20.8 8.6c0 4.6-8.8 10.4-8.8 10.4S3.2 13.2 3.2 8.6a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    house: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"/>'
  };

  const emojiIcons = {
    0x1f517: ["link", "Link"],
    0x2192: ["arrow", "Avançar"],
    0x2195: ["refresh", "Movimento"],
    0x2197: ["arrow", "Abrir em nova aba"],
    0x2191: ["arrow", "Subir"],
    0x2193: ["arrow", "Descer"],
    0x25cf: ["sparkles", "Status"],
    0x23f1: ["settings", "Tempo"],
    0x2699: ["settings", "Configurações"],
    0x1fa9f: ["window", "Janela"],
    0x26a1: ["zap", "Energia"],
    0x1f9a7: ["sparkles", "Destaque"],
    0x1f33f: ["leaf", "Linux Mint"],
    0x1f3af: ["target", "Meta"],
    0x1f4ca: ["chart", "Gráfico"],
    0x1f680: ["rocket", "Lançamento"],
    0x1f3ae: ["gamepad", "Jogos"],
    0x1f4d0: ["ruler", "Régua"],
    0x2714: ["check", "Concluído"],
    0x1f4ac: ["message", "Mensagem"],
    0x1f3a8: ["palette", "Design"],
    0x1f4f1: ["phone", "Celular"],
    0x1f9f2: ["magnet", "Ímã"],
    0x1f419: ["cpu", "Código"],
    0x1f9e0: ["brain", "Inteligência"],
    0x1f98a: ["sparkles", "Projeto"],
    0x1f916: ["cpu", "Assistente"],
    0x1f4e7: ["mail", "E-mail"],
    0x1f4e6: ["package", "Pacote"],
    0x1f4cf: ["ruler", "Medida"],
    0x1f50c: ["plug", "Integração"],
    0x1f393: ["graduation", "Educação"],
    0x1f6e0: ["settings", "Ferramentas"],
    0x1f4bc: ["briefcase", "Trabalho"],
    0x1f50d: ["search", "Pesquisa"],
    0x2694: ["settings", "Engenharia"],
    0x1f4cd: ["pin", "Localização"],
    0x1f3b5: ["music", "Áudio"],
    0x1f310: ["globe", "Web"],
    0x1f4bb: ["laptop", "Computador"],
    0x274c: ["close", "Fechar"],
    0x1f5fa: ["map", "Mapa"],
    0x1f504: ["refresh", "Atualizar"],
    0x1f30d: ["globe", "Planeta"],
    0x1f426: ["sparkles", "Projeto"],
    0x1f3e0: ["home", "Início"],
    0x2716: ["close", "Fechar"],
    0x1f441: ["eye", "Visualizar"],
    0x270d: ["pen", "Escrever"],
    0x1f1e7: ["globe", "Brasil"],
    0x1f1ec: ["globe", "Brasil"],
    0x1f389: ["sparkles", "Celebração"],
    0x1f440: ["eye", "Visualizar"],
    0x1f464: ["user", "Pessoa"],
    0x2696: ["scale", "Balança"],
    0x26a0: ["warning", "Atenção"],
    0x1f9e9: ["puzzle", "Módulo"],
    0x1f4a1: ["bulb", "Ideia"],
    0x1f4e5: ["inbox", "Entrada"],
    0x2794: ["arrow", "Avançar"],
    0x1f4e4: ["inbox", "Saída"],
    0x1f522: ["settings", "Números"],
    0x1f4c8: ["trending", "Tendência"],
    0x1f50a: ["volume", "Áudio"],
    0x1f95a: ["sparkles", "Item"],
    0x1f53b: ["warning", "Atenção"],
    0x1f4dc: ["book", "Documento"],
    0x1f5a5: ["monitor", "Computador"],
    0x1f5a8: ["printer", "Impressão"],
    0x2709: ["mail", "E-mail"],
    0x1f4e1: ["signal", "Sinal"],
    0x1f3e2: ["building", "Organização"],
    0x1f30e: ["globe", "Planeta"],
    0x1f427: ["sparkles", "Projeto"],
    0x1f535: ["globe", "Fedora"],
    0x1f4c2: ["package", "Pasta"],
    0x2715: ["close", "Fechar"],
    0x2705: ["check", "Concluído"],
    0x1f7e8: ["window", "Painel"],
    0x1f537: ["sparkles", "Destaque"],
    0x1f40d: ["sparkles", "Código"],
    0x2615: ["sparkles", "Café"],
    0x1f418: ["sparkles", "Projeto"],
    0x1f9ed: ["compass", "Navegação"],
    0x1f396: ["medal", "Reconhecimento"],
    0x1f3c5: ["medal", "Conquista"],
    0x1f9f1: ["package", "Estrutura"],
    0x1f4c4: ["book", "Documento"],
    0x1f30c: ["sparkles", "Noite"],
    0x1f3ac: ["image", "Vídeo"],
    0x1f532: ["window", "Painel"],
    0x1f6e1: ["shield", "Proteção"],
    0x1f52c: ["microscope", "Pesquisa"],
    0x1f48d: ["sparkles", "Destaque"],
    0x1f512: ["shield", "Protegido"],
    0x1f527: ["settings", "Ferramenta"],
    0x1fa7a: ["heart", "Saúde"],
    0x1f9b4: ["heart", "Saúde"],
    0x1f5bc: ["image", "Imagem"],
    0x1f31f: ["sparkles", "Destaque"],
    0x1f52e: ["sparkles", "Previsão"],
    0x2728: ["sparkles", "Destaque"],
    0x1f4de: ["phone", "Telefone"],
    0x1f947: ["medal", "Primeiro lugar"],
    0x1f948: ["medal", "Segundo lugar"],
    0x1f949: ["medal", "Terceiro lugar"],
    0x1f525: ["zap", "Energia"],
    0x1f1f7: ["globe", "Brasil"],
    0x1f446: ["arrow", "Indicação"],
    0x1f4a5: ["zap", "Impacto"],
    0x1f313: ["sparkles", "Noite"]
  };

  const emojiPattern = new RegExp(
    "(?:\\p{Regional_Indicator}{2}|\\p{Extended_Pictographic}(?:\\uFE0F|\\uFE0E)?(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|\\uFE0E)?)*)",
    "gu"
  );
  const iconSvg = (name) =>
    `<svg class="dsbrti-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.sparkles}</svg>`;

  function emojiInfo(value) {
    const codePoint = Array.from(value)[0]?.codePointAt(0);
    return emojiIcons[codePoint] || ["sparkles", "Ícone"];
  }

  function isExcluded(node) {
    const parent = node.parentElement;
    return !parent || Boolean(parent.closest(
      "script, style, textarea, input, select, option, code, pre, kbd, samp, svg, [contenteditable='true'], [data-emoji-preserve]"
    ));
  }

  function replaceEmojiText(textNode) {
    if (isExcluded(textNode)) return;
    const source = textNode.nodeValue;
    if (!source || !emojiPattern.test(source)) {
      emojiPattern.lastIndex = 0;
      return;
    }
    emojiPattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    for (const match of source.matchAll(emojiPattern)) {
      const index = match.index ?? 0;
      if (index > cursor) fragment.append(source.slice(cursor, index));
      const [iconName, label] = emojiInfo(match[0]);
      const wrapper = document.createElement("span");
      wrapper.className = "dsbrti-inline-icon";
      wrapper.setAttribute("aria-label", label);
      wrapper.setAttribute("role", "img");
      wrapper.innerHTML = iconSvg(iconName);
      fragment.append(wrapper);
      cursor = index + match[0].length;
    }
    if (cursor < source.length) fragment.append(source.slice(cursor));
    textNode.replaceWith(fragment);
  }

  function enhanceTree(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      replaceEmojiText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(replaceEmojiText);
  }

  function enhanceAttributes() {
    document.querySelectorAll("[title], [aria-label], img[alt]").forEach((element) => {
      for (const attribute of ["title", "aria-label", "alt"]) {
        const value = element.getAttribute(attribute);
        if (value && emojiPattern.test(value)) {
          emojiPattern.lastIndex = 0;
          element.setAttribute(attribute, value.replace(emojiPattern, (match) => emojiInfo(match)[1]));
        }
        emojiPattern.lastIndex = 0;
      }
    });
  }

  function enhanceThemeButtons() {
    const themeIcons = { ubuntu: "globe", fedora: "leaf", winxp: "monitor" };
    const themeNames = { ubuntu: "Ubuntu", fedora: "Linux Mint", winxp: "GNOME" };
    document.querySelectorAll(".theme-btn[data-theme]").forEach((button) => {
      const theme = button.dataset.theme;
      if (!themeIcons[theme]) return;
      button.innerHTML = iconSvg(themeIcons[theme]);
      button.title = themeNames[theme];
      button.setAttribute("aria-label", `Usar tema ${themeNames[theme]}`);
    });
  }

  function enhanceNavigation() {
    const links = document.querySelector(".nav-links");
    const hasWorkspaceLink = links && Array.from(links.querySelectorAll("a")).some((link) => {
      try {
        return new URL(link.href, location.href).pathname === "/workspace.html";
      } catch {
        return false;
      }
    });
    if (links && !hasWorkspaceLink) {
      const item = document.createElement("li");
      item.innerHTML = `<a href="/workspace.html" data-dsbrti-workspace>${iconSvg("window")}<span>Espaço de trabalho</span></a>`;
      links.append(item);
    }

    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", [...rel].join(" "));
    });

    if (!location.pathname.endsWith("/workspace.html") &&
        !document.querySelector("[data-dsbrti-launcher]")) {
      const launcher = document.createElement("a");
      launcher.className = "dsbrti-launcher";
      launcher.href = "/workspace.html";
      launcher.dataset.dsbrtiLauncher = "";
      launcher.setAttribute("aria-label", "Abrir espaço de trabalho");
      launcher.innerHTML = `${iconSvg("window")}<span>Workspace</span>`;
      document.body.append(launcher);
    }
  }

  function start() {
    enhanceTree(document.body);
    enhanceAttributes();
    enhanceThemeButtons();
    enhanceNavigation();

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach(enhanceTree);
      }
      enhanceAttributes();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
