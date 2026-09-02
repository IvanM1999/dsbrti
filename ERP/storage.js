/* ============================================================
   storage.js
   DestinyServices OS - Cliente API & Persistência Remota (Render / PostgreSQL)
   ============================================================ */
"use strict";

const Storage = (() => {
    const STORES = ["clients", "budgets", "orders", "payments", "logs", "warranties"];

    async function getAll(store) {
        try {
            const res = await fetch(`/api/${store}`);
            if (!res.ok) throw new Error(`Erro ao buscar ${store}`);
            return await res.json();
        } catch (err) {
            console.error(`Erro em getAll(${store}):`, err);
            return [];
        }
    }

    async function get(store, id) {
        try {
            const res = await fetch(`/api/${store}/${id}`);
            if (!res.ok) throw new Error(`Erro ao buscar ${store}/${id}`);
            return await res.json();
        } catch (err) {
            console.error(`Erro em get(${store}, ${id}):`, err);
            return null;
        }
    }

    async function save(store, object) {
        try {
            const method = object.id ? 'PUT' : 'POST';
            const url = object.id ? `/api/${store}/${object.id}` : `/api/${store}`;
            
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(object)
            });

            if (!res.ok) throw new Error(`Erro ao salvar em ${store}`);
            return await res.json();
        } catch (err) {
            console.error(`Erro em save(${store}):`, err);
            throw err;
        }
    }

    async function remove(store, id) {
        try {
            const res = await fetch(`/api/${store}/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error(`Erro ao remover de ${store}`);
            return true;
        } catch (err) {
            console.error(`Erro em remove(${store}, ${id}):`, err);
            return false;
        }
    }

    async function clear(store) {
        try {
            const res = await fetch(`/api/${store}/clear`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error(`Erro ao limpar ${store}`);
            return true;
        } catch (err) {
            console.error(`Erro em clear(${store}):`, err);
            return false;
        }
    }

    function setting(key, value) {
        if (value === undefined) {
            const val = localStorage.getItem(key);
            try {
                return val ? JSON.parse(val) : null;
            } catch {
                return val;
            }
        }
        localStorage.setItem(key, JSON.stringify(value));
    }

    /* ============================================================
       RECURSOS DE BACKUP COMPLETO
       ============================================================ */
    async function exportBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                version: "2.0",
                stores: {}
            };

            for (const storeName of STORES) {
                backupData.stores[storeName] = await getAll(storeName);
            }

            backupData.settings = { ...localStorage };

            const jsonStr = JSON.stringify(backupData, null, 2);
            const dateStr = new Date().toISOString().slice(0, 10);
            
            if (typeof Utils !== "undefined" && Utils.download) {
                Utils.download(`DestinyServices_OS_Backup_${dateStr}.json`, jsonStr);
            } else {
                const blob = new Blob([jsonStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `DestinyServices_OS_Backup_${dateStr}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }

            if (typeof Utils !== "undefined") Utils.toast("Backup exportado com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao exportar backup:", err);
            if (typeof Utils !== "undefined") Utils.toast("Falha ao exportar backup.", "danger");
        }
    }

    async function importBackup(jsonFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.stores) {
                        throw new Error("Arquivo de backup inválido.");
                    }

                    for (const storeName of STORES) {
                        if (data.stores[storeName]) {
                            await clear(storeName);
                            for (const item of data.stores[storeName]) {
                                await save(storeName, item);
                            }
                        }
                    }

                    if (data.settings) {
                        Object.keys(data.settings).forEach(k => {
                            localStorage.setItem(k, data.settings[k]);
                        });
                    }

                    if (typeof Utils !== "undefined") Utils.toast("Backup restaurado com sucesso!", "success");
                    resolve(true);
                } catch (err) {
                    console.error("Erro ao restaurar backup:", err);
                    if (typeof Utils !== "undefined") Utils.toast("Erro ao ler o arquivo de backup.", "danger");
                    reject(err);
                }
            };
            reader.readAsText(jsonFile);
        });
    }

    return {
        open: async () => true,
        getAll,
        get,
        save,
        remove,
        clear,
        setting,
        exportBackup,
        importBackup
    };
})();
