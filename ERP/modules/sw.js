/* ============================================================
   sw.js
   DestinyServices OS
   Service Worker
   ============================================================ */

"use strict";

const CACHE_NAME = "destinyservices-os-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./router.js",
    "./storage.js",
    "./utils.js",
    "./api.js",
    "./dashboard.js",
    "./clients.js",
    "./budget.js",
    "./orders.js",
    "./finance.js",
    "./reports.js",
    "./settings.js",
    "./sync.js",
    "./auth.js"
];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
    );

    self.skipWaiting();

});

self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    self.clients.claim();

});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cache => {

            if (cache) {
                return cache;
            }

            return fetch(event.request)
                .then(response => {

                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache =>
                        cache.put(event.request, copy)
                    );

                    return response;

                })
                .catch(() => caches.match("./index.html"));

        })
    );

});
