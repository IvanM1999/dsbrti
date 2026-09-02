/* ============================================================
   public/app.js
   DestinyServices OS
   Unificação: Comunicação da API + Inicialização da SPA
   ============================================================ */

"use strict";

/* --- Módulo de Comunicação com a API (Antigo api.js) --- */
const API = (() => {

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
                throw new Error(`Erro na API: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[API Error]: ${endpoint}`, error);
            throw error;
        }
    }

    async function ping() {
        return await request("/ping");
    }

    return {
        ping,
        request
    };

})();

/* --- Módulo de Inicialização da Aplicação (Antigo app.js) --- */
const App = (() => {

    async function init() {

        try {

            await Storage.open();

            await API.ping();

            initializeTheme();

            initializeSearch();

            initializeEvents();

            Router.start();

            console.info(
                "DestinyServices OS iniciado."
            );

        }

        catch (error) {

            console.error(error);

            const contentElement = document.getElementById("page-content");

            if (contentElement) {
                contentElement.innerHTML = `
<div class="card">

<h2>Erro ao iniciar o sistema</h2>

<p>${error.message}</p>

</div>
`;
            }

        }

    }

    function initializeTheme() {

        const savedTheme =

            Storage.setting("theme")

            ||

            "light";

        document.documentElement.dataset.theme =

            savedTheme;

        const button =

            document.getElementById("theme-toggle");

        if (!button) return;

        button.onclick = () => {

            const current =

                document.documentElement.dataset.theme;

            const next =

                current === "dark"

                ? "light"

                : "dark";

            document.documentElement.dataset.theme =

                next;

            Storage.setting(

                "theme",

                next

            );

        };

    }

    function initializeSearch() {

        const search =

            document.getElementById("global-search");

        if (!search) return;

        search.addEventListener(

            "input",

            Utils.debounce(

                event => {

                    const value =

                        event.target.value

                        .trim()

                        .toLowerCase();

                    document

                        .querySelectorAll("table tbody tr")

                        .forEach(row => {

                            row.style.display =

                                row.innerText

                                .toLowerCase()

                                .includes(value)

                                ? ""

                                : "none";

                        });

                },

                250

            )

        );

    }

    function initializeEvents() {

        const budgetButton =

            document.getElementById(

                "new-budget-btn"

            );

        if (budgetButton) {

            budgetButton.onclick = () =>

                Router.navigate(

                    "budgets"

                );

        }

        window.addEventListener(

            "online",

            () =>

                Utils.toast(

                    "Conexão restaurada.",

                    "success"

                )

        );

        window.addEventListener(

            "offline",

            () =>

                Utils.toast(

                    "Modo offline.",

                    "warning"

                )

        );

    }

    return {

        init

    };

})();

window.addEventListener(

    "DOMContentLoaded",

    App.init

);