/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/app.js
   Unificação: API + Roteamento + Inicialização da SPA
   ============================================================ */

"use strict";

import { Utils } from './utils.js';

/* --- Cliente HTTP / API --- */
export const API = (() => {
    const BASE_URL = "/api";

    function normalizeEndpoint(endpoint) {
        if (!endpoint) return BASE_URL;
        if (endpoint.startsWith("/api")) return endpoint;
        return `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    }

    async function request(endpoint, options = {}) {
        const normalizedEndpoint = normalizeEndpoint(endpoint);

        try {
            const response = await fetch(normalizedEndpoint, {
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers
                },
                ...options
            });

            const text = await response.text();
            let payload = null;

            if (text) {
                try {
                    payload = JSON.parse(text);
                } catch {
                    payload = text;
                }
            }

            if (!response.ok) {
                throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
            }

            return payload ?? { success: true };
        } catch (error) {
            console.error(`[API Error]: ${normalizedEndpoint}`, error);
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
            await initializeCompanyDefaults();
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

    async function initializeCompanyDefaults() {
        const defaults = {
            nomeEmpresa: 'Ivan Montibeller',
            razaoSocial: 'Destiny Services TI & Destiny ServicesBR',
            cnpj: '45.609.430/0001-43',
            telefone: '',
            chavePix: '',
            endereco: ''
        };

        const current = {
            nomeEmpresa: localStorage.getItem('cfg_empresa_nome') || defaults.nomeEmpresa,
            razaoSocial: localStorage.getItem('cfg_empresa_razao_social') || defaults.razaoSocial,
            cnpj: localStorage.getItem('cfg_empresa_cnpj') || defaults.cnpj,
            telefone: localStorage.getItem('cfg_empresa_telefone') || defaults.telefone,
            chavePix: localStorage.getItem('cfg_empresa_pix') || defaults.chavePix,
            endereco: localStorage.getItem('cfg_empresa_endereco') || defaults.endereco
        };

        try {
            const response = await API.get('/config');
            if (response?.empresa) {
                current.nomeEmpresa = response.empresa.nomeEmpresa || current.nomeEmpresa;
                current.razaoSocial = response.empresa.razaoSocial || current.razaoSocial;
                current.cnpj = response.empresa.cnpj || current.cnpj;
                current.telefone = response.empresa.telefone || current.telefone;
                current.endereco = response.empresa.endereco || current.endereco;
            }
        } catch (error) {
            console.warn('Não foi possível carregar os dados da empresa do servidor, usando os valores locais.', error);
        }

        localStorage.setItem('cfg_empresa_nome', current.nomeEmpresa);
        localStorage.setItem('cfg_empresa_razao_social', current.razaoSocial);
        localStorage.setItem('cfg_empresa_cnpj', current.cnpj);
        localStorage.setItem('cfg_empresa_telefone', current.telefone);
        localStorage.setItem('cfg_empresa_pix', current.chavePix);
        localStorage.setItem('cfg_empresa_endereco', current.endereco);
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
