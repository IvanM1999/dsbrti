/* ============================================================
   logger.js
   DestinyServices OS
   Auditoria do Sistema
   ============================================================ */

"use strict";

const Logger = (() => {

    async function write(action, entity, entityId = "", details = "") {

        const session =

            typeof Auth !== "undefined"

            ? Auth.session()

            : null;

        const log = {

            id: Utils.uuid(),

            action,

            entity,

            entityId,

            details,

            user: session?.username || "local",

            createdAt: Utils.now()

        };

        await Storage.save(

            "logs",

            log

        );

    }

    async function all() {

        const logs =

            await Storage.getAll("logs");

        return logs.sort(

            (a, b) =>

                new Date(b.createdAt) -

                new Date(a.createdAt)

        );

    }

    async function clear() {

        await Storage.clear("logs");

    }

    async function exportLogs() {

        const logs =

            await all();

        Utils.download(

            "logs.json",

            JSON.stringify(

                logs,

                null,

                2

            )

        );

    }

    async function dashboard() {

        const logs =

            await all();

        return logs.slice(0, 20);

    }

    return {

        write,

        all,

        clear,

        exportLogs,

        dashboard

    };

})();