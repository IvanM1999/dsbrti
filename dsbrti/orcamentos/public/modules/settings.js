/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/modules/settings.js
   Módulo de Configurações do Sistema ERP
   ============================================================ */

"use strict";

import { Utils } from '../utils.js';

export const Settings = {
    async render(container) {
        // Recupera configurações salvas no localStorage (com valores padrão)
        const config = this.getConfig();
        const currentTheme = document.documentElement.dataset.theme || 'light';

        container.innerHTML = `
            <h2>Configurações do Sistema</h2>

            <!-- Card de Aparência -->
            <div class="card">
                <h3>Aparência e Interface</h3>
                <div class="form-group" style="max-width: 300px;">
                    <label for="select-theme">Tema Visual</label>
                    <select id="select-theme">
                        <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Claro (Light)</option>
                        <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Escuro (Dark)</option>
                    </select>
                </div>
            </div>

            <!-- Card de Dados da Empresa -->
            <div class="card">
                <h3>Dados da Empresa / Prestador</h3>
                <form id="form-settings">
                    <div class="form-group">
                        <label for="emp-nome">Nome Fantasia / Razão Social</label>
                        <input type="text" id="emp-nome" value="${Utils.escape(config.nomeEmpresa)}" placeholder="Ex: DestinyServices BR" required>
                    </div>

                    <div class="form-group">
                        <label for="emp-cnpj">CPF ou CNPJ</label>
                        <input type="text" id="emp-cnpj" value="${Utils.escape(config.cnpj)}" placeholder="00.000.000/0001-00">
                    </div>

                    <div class="form-group">
                        <label for="emp-telefone">Telefone / WhatsApp</label>
                        <input type="text" id="emp-telefone" value="${Utils.escape(config.telefone)}" placeholder="(00) 00000-0000">
                    </div>

                    <div class="form-group">
                        <label for="emp-pix">Chave Pix Padrão (Cobranças/OS)</label>
                        <input type="text" id="emp-pix" value="${Utils.escape(config.chavePix)}" placeholder="CNPJ, CPF, E-mail ou Telefone">
                    </div>

                    <div class="form-group" style="width: 100%;">
                        <label for="emp-endereco">Endereço Completo</label>
                        <input type="text" id="emp-endereco" value="${Utils.escape(config.endereco)}" placeholder="Rua, Número, Bairro, Cidade - UF">
                    </div>

                    <div style="width: 100%; margin-top: 15px;">
                        <button type="submit" class="btn btn-primary">Salvar Configurações</button>
                    </div>
                </form>
            </div>

            <!-- Card de Diagnóstico do Sistema -->
            <div class="card">
                <h3>Status do ERP</h3>
                <p style="margin-bottom: 10px; font-size: 0.95rem;">
                    <strong>Versão:</strong> 1.0.0 (Modular SPA)<br>
                    <strong>Armazenamento Local:</strong> Ativo<br>
                    <strong>Conectividade API:</strong> <span id="status-api-indicator" style="color: #f39c12;">Verificando...</span>
                </p>
            </div>
        `;

        this.checkApiStatus(container);
        this.bindEvents(container);
    },

    getConfig() {
        return {
            nomeEmpresa: localStorage.getItem('cfg_empresa_nome') || 'DestinyServices BR',
            cnpj: localStorage.getItem('cfg_empresa_cnpj') || '',
            telefone: localStorage.getItem('cfg_empresa_telefone') || '',
            chavePix: localStorage.getItem('cfg_empresa_pix') || '',
            endereco: localStorage.getItem('cfg_empresa_endereco') || ''
        };
    },

    bindEvents(container) {
        // Alteração de Tema em tempo real
        const selectTheme = container.querySelector('#select-theme');
        if (selectTheme) {
            selectTheme.addEventListener('change', (e) => {
                const theme = e.target.value;
                document.documentElement.dataset.theme = theme;
                localStorage.setItem('theme', theme);
                Utils.toast(`Tema alterado para ${theme.toUpperCase()}.`, 'info');
            });
        }

        // Submissão do formulário de empresa
        const form = container.querySelector('#form-settings');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const nome = container.querySelector('#emp-nome').value.trim();
                const cnpj = container.querySelector('#emp-cnpj').value.trim();
                const telefone = container.querySelector('#emp-telefone').value.trim();
                const chavePix = container.querySelector('#emp-pix').value.trim();
                const endereco = container.querySelector('#emp-endereco').value.trim();

                localStorage.setItem('cfg_empresa_nome', nome);
                localStorage.setItem('cfg_empresa_cnpj', cnpj);
                localStorage.setItem('cfg_empresa_telefone', telefone);
                localStorage.setItem('cfg_empresa_pix', chavePix);
                localStorage.setItem('cfg_empresa_endereco', endereco);

                Utils.toast('Configurações da empresa salvas com sucesso!', 'success');
            });
        }
    },

    async checkApiStatus(container) {
        const indicator = container.querySelector('#status-api-indicator');
        if (!indicator) return;

        try {
            if (window.api && typeof window.api.ping === 'function') {
                await window.api.ping();
                indicator.style.color = '#27ae60';
                indicator.textContent = 'Online / Conectado ao Servidor';
            } else {
                indicator.style.color = '#e74c3c';
                indicator.textContent = 'Offline / Modo Local';
            }
        } catch (err) {
            indicator.style.color = '#e74c3c';
            indicator.textContent = 'Servidor Indisponível (Modo Offline)';
        }
    }
};
