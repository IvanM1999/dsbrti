/* ============================================================
   router.js
   DestinyServices OS
   SPA Router
   ============================================================ */

"use strict";

const Router = (() => {

    const routes = {};

    let currentRoute = "dashboard";

    function register(name, render) {
        routes[name] = render;
    }

    function navigate(route) {

        if (!routes[route]) {
            route = "dashboard";
        }

        currentRoute = route;

        document
            .querySelectorAll("[data-route]")
            .forEach(link => {

                link.classList.remove("active");

                if (link.dataset.route === route) {
                    link.classList.add("active");
                }

            });

        routes[route]();

        history.replaceState(
            {},
            "",
            "#" + route
        );

    }

    function start() {

        const hash = window.location.hash
            .replace("#", "");

        if (hash && routes[hash]) {
            navigate(hash);
        } else {
            navigate("dashboard");
        }

    }

    function getMain() {
        return document.getElementById("page-content");
    }

    function render(html) {
        getMain().innerHTML = html;
    }

    function current() {
        return currentRoute;
    }

    return {

        register,
        navigate,
        start,
        render,
        current

    };

})();

window.addEventListener(
    "click",
    event => {
        const link = event.target.closest("[data-route]");
        if (!link) return;
        event.preventDefault();
        Router.navigate(
            link.dataset.route
        );
    }
);

window.addEventListener(
    "hashchange",
    () => {
        const hash = location.hash.replace("#", "");
        Router.navigate(hash);
    }
);