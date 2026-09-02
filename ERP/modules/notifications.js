/* ============================================================
   notifications.js
   DestinyServices OS
   Central de Notificações
   ============================================================ */

"use strict";

const Notifications = (() => {

    const STORE = "notifications";

    async function add(title, message, type = "info") {

        await Storage.save(

            STORE,

            {

                id: Utils.uuid(),

                title,

                message,

                type,

                read: false,

                createdAt: Utils.now()

            }

        );

        updateBadge();

    }

    async function all() {

        const data =

            await Storage.getAll(STORE);

        return data.sort(

            (a, b) =>

                new Date(b.createdAt) -

                new Date(a.createdAt)

        );

    }

    async function unread() {

        const data =

            await all();

        return data.filter(

            item => !item.read

        );

    }

    async function markRead(id) {

        const item =

            await Storage.get(

                STORE,

                id

            );

        if (!item) return;

        item.read = true;

        await Storage.save(

            STORE,

            item

        );

        updateBadge();

    }

    async function remove(id) {

        await Storage.delete(

            STORE,

            id

        );

        updateBadge();

    }

    async function clear() {

        await Storage.clear(

            STORE

        );

        updateBadge();

    }

    async function updateBadge() {

        const badge =

            document.getElementById(

                "notificationBadge"

            );

        if (!badge) return;

        const total =

            (await unread()).length;

        badge.textContent = total;

        badge.hidden = total === 0;

    }

    async function render() {

        const notifications =

            await all();

        Router.render(`

<div class="card">

<div class="card-title">

<span>Notificações</span>

<button

id="clearNotifications"

class="btn btn-danger">

Limpar

</button>

</div>

<div>

${notifications.length === 0

? "<p>Nenhuma notificação.</p>"

: notifications.map(item => `

<div class="card">

<strong>

${Utils.escape(item.title)}

</strong>

<p>

${Utils.escape(item.message)}

</p>

<small>

${new Date(item.createdAt)

.toLocaleString("pt-BR")}

</small>

<br><br>

<button

class="btn btn-success btn-sm notification-read"

data-id="${item.id}">

Marcar como lida

</button>

<button

class="btn btn-danger btn-sm notification-delete"

data-id="${item.id}">

Excluir

</button>

</div>

`).join("")}

</div>

</div>

`);

        document

            .querySelectorAll(".notification-read")

            .forEach(button =>

                button.onclick = async e => {

                    await markRead(

                        e.target.dataset.id

                    );

                    render();

                }

            );

        document

            .querySelectorAll(".notification-delete")

            .forEach(button =>

                button.onclick = async e => {

                    await remove(

                        e.target.dataset.id

                    );

                    render();

                }

            );

        document

            .getElementById(

                "clearNotifications"

            )

            .onclick = async () => {

                await clear();

                render();

            };

    }

    Router.register(

        "notifications",

        render

    );

    return {

        add,

        all,

        unread,

        markRead,

        remove,

        clear,

        updateBadge,

        render

    };

})();