/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/utils.js
   Utilitários Globais
   ============================================================ */

"use strict";

export const Utils = {
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    },

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    },

    escape(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    onlyNumbers(str) {
        return String(str || '').replace(/\D/g, '');
    },

    // Aprimorado para exibir um alerta visual real na tela do usuário
    toast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.textContent = message;
        
        // Estilos embutidos para garantir que funcione sem depender do CSS externo
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '6px';
        toast.style.color = '#fff';
        toast.style.fontWeight = 'bold';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';

        // Cores baseadas no tipo de alerta
        if (type === 'success') toast.style.backgroundColor = '#27ae60'; // Verde
        else if (type === 'error') toast.style.backgroundColor = '#e74c3c'; // Vermelho
        else if (type === 'warning') toast.style.backgroundColor = '#f39c12'; // Laranja
        else toast.style.backgroundColor = '#34495e'; // Azul/Cinza (Info)

        document.body.appendChild(toast);

        // Animação de entrada
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Remove o toast após 3 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
