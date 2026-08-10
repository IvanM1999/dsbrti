// autologout.js

(function() {
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milissegundos
  let timeoutTimer;

  // Função disparada quando a inatividade atinge o limite
  function forceLogout() {
    console.warn("Sessão expirada devido à inatividade do usuário.");
    
    // Apaga o cookie do lado do cliente (expira imediatamente)
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Redireciona para a tela de login alertando a expiração
    window.location.href = "/login?reason=expired";
  }

  // Reinicia o contador a cada ação do usuário
  function resetInactivityTimer() {
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(forceLogout, INACTIVITY_TIMEOUT);
  }

  // Eventos monitorados para considerar o usuário ativo
  const activityEvents = [
    'mousemove', 
    'mousedown', 
    'keypress', 
    'scroll', 
    'touchstart', 
    'click'
  ];

  // Adiciona ouvintes com controle de frequência (debounce leve)
  let throttleTimer;
  activityEvents.forEach(event => {
    window.addEventListener(event, () => {
      if (!throttleTimer) {
        resetInactivityTimer();
        throttleTimer = setTimeout(() => { throttleTimer = null; }, 1000);
      }
    }, { passive: true });
  });

  // Inicializa o temporizador na carga da página
  resetInactivityTimer();
})();
