/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/services/pix.js
   Utilitário de Pagamento Pix
   ============================================================ */

"use strict";

export const PixService = {
    generatePayload({ key, name, city, amount, txtId = 'ERP' }) {
        // Retorna a string estática simples para exibição ou cópia
        return `PIX_PAYLOAD_SIMULATED:${key}:${amount}:${txtId}`;
    },

    copyToClipboard(payload) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(payload);
        }
        return Promise.reject('Clipboard API não disponível');
    }
};
