/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/app.js
   Unificação: API + Roteamento + Inicialização da SPA
   ============================================================ */

"use strict";

import { Utils } from './utils.js';

/* --- Cliente HTTP / API --- */
export const API = (() => {
    const BASE_URL = "/api";

    async function request(endpoint, options = {}) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[API Error]: ${endpoint}`, error);
            throw error;
        }
    }

    return {
        ping: () => request("/ping"),
        get: (endpoint) => request(endpoint, { method: "GET" }),
        post: (endpoint, body) => request(endpoint, { method: "POST", body: JSON.stringify(body) }),
        delete: (endpoint) => request(endpoint, { method: "DELETE" })
    };
})();

// Expor API no escopo global do window para acesso rápido nos módulos
window.api = API;

/* --- Roteador Dinâmico da SPA --- */
const Router = (() => {
    const routes = {};

    function register(route, handler) {
        routes[route] = handler;
    }

    async function navigate() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        const content = document.getElementById("page-content");

        if (!content) return;

        try {
            switch (hash) {
                case 'dashboard': {
                    const { Dashboard } = await import('./modules/dashboard.js');
                    await Dashboard.render(content);
                    break;
                }
                case 'clientes': {
                    const { Clientes } = await import('./modules/clientes.js');
                    await Clientes.render(content);
                    break;
                }
                case 'estoque': {
                    const { Estoque } = await import('./modules/estoque.js');
                    await Estoque.render(content);
                    break;
                }
                case 'finance': {
                    const { Financeiro } = await import('./modules/finance.js');
                    await Financeiro.render(content);
                    break;
                }
                case 'os': {
                    const { OS } = await import('./modules/os.js');
                    await OS.render(content);
                    break;
                }
                case 'settings': {
                    const { Settings } = await import('./modules/settings.js');
                    if (typeof Settings.render === 'function') {
                        await Settings.render(content);
                    }
                    break;
                }
                default:
                    content.innerHTML = `
                        <div class="card">
                            <h2>Página Não Encontrada</h2>
                            <p>A rota <strong>#${Utils.escape(hash)}</strong> não existe no sistema.</p>
                        </div>
                    `;
            }
        } catch (err) {
            console.error(`[Router Error] Falha ao carregar rota: #${hash}`, err);
            content.innerHTML = `
                <div class="card">
                    <h2>Erro ao Carregar Módulo</h2>
                    <p>${Utils.escape(err.message)}</p>
                </div>
            `;
        }
    }

    function start() {
        window.addEventListener('hashchange', navigate);
        navigate();
    }

    return { register, start, navigate };
})();

/* --- Inicializador Principal do App --- */
const App = (() => {
    async function init() {
        try {
            // Tenta verificar disponibilidade do servidor
            try {
                await API.ping();
            } catch (e) {
                console.warn("Servidor offline ou operando localmente sem endpoint de ping.");
            }

            initializeTheme();
            initializeSearch();
            initializeEvents();

            Router.start();
            console.info("DestinyServices OS iniciado com sucesso.");
        } catch (error) {
            console.error("[App Init Error]:", error);
            const contentElement = document.getElementById("page-content");
            if (contentElement) {
                contentElement.innerHTML = `
                    <div class="card">
                        <h2>Erro ao Iniciar o Sistema</h2>
                        <p>${Utils.escape(error.message)}</p>
                    </div>
                `;
            }
        }
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.dataset.theme = savedTheme;

        const button = document.getElementById("theme-toggle");
        if (!button) return;

        button.onclick = () => {
            const current = document.documentElement.dataset.theme;
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.dataset.theme = next;
            localStorage.setItem("theme", next);
        };
    }

    function initializeSearch() {
        const search = document.getElementById("global-search");
        if (!search) return;

        search.addEventListener("input", (event) => {
            const value = event.target.value.trim().toLowerCase();
            document.querySelectorAll("table tbody tr").forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
            });
        });
    }

    function initializeEvents() {
        window.addEventListener("online", () => Utils.toast("Conexão restaurada.", "success"));
        window.addEventListener("offline", () => Utils.toast("Modo offline ativo.", "warning"));
    }

    return { init };
})();

// Inicializa a aplicação após o carregamento da árvore DOM
window.addEventListener("DOMContentLoaded", App.init);
