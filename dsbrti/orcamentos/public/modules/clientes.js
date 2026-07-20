/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/modules/clientes.js
   Gestão de Clientes
   ============================================================ */

"use strict";

import { Utils } from '../utils.js';

export const Clientes = {
    async render(container) {
        container.innerHTML = '<h2>Clientes</h2><p>Carregando...</p>';

        try {
            const clientes = await window.api.get('/api/clientes');

            container.innerHTML = `
                <h2>Gestão de Clientes</h2>
                <div class="card">
                    <h3>Cadastrar Novo Cliente</h3>
                    <form id="form-cliente">
                        <div class="form-group">
                            <label>Nome Completo</label>
                            <input type="text" id="cli-nome" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="cli-email">
                        </div>
                        <div class="form-group">
                            <label>Telefone</label>
                            <input type="text" id="cli-telefone">
                        </div>
                        <div class="form-group">
                            <label>Endereço</label>
                            <input type="text" id="cli-endereco">
                        </div>
                        <div style="width: 100%; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary">Salvar Cliente</button>
                        </div>
                    </form>
                </div>
                <div class="card">
                    <h3>Lista de Clientes</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clientes.length > 0 ? clientes.map(c => `
                                <tr>
                                    <td>${c.id}</td>
                                    <td>${Utils.escape(c.nome)}</td>
                                    <td>${Utils.escape(c.email || '-')}</td>
                                    <td>${Utils.escape(c.telefone || '-')}</td>
                                    <td>
                                        <button data-id="${c.id}" class="btn-danger btn-deletar-cli">Excluir</button>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">Nenhum cliente cadastrado.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;

            this.bindEvents(container);

        } catch (error) {
            console.error('[Clientes Error]:', error);
            container.innerHTML = '<h2>Clientes</h2><p>Erro ao carregar clientes.</p>';
        }
    },

    bindEvents(container) {
        const form = container.querySelector('#form-cliente');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await window.api.post('/api/clientes', {
                    nome: container.querySelector('#cli-nome').value,
                    email: container.querySelector('#cli-email').value,
                    telefone: container.querySelector('#cli-telefone').value,
                    endereco: container.querySelector('#cli-endereco').value
                });
                this.render(container);
            });
        }

        container.querySelectorAll('.btn-deletar-cli').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover este cliente?')) {
                    await window.api.delete(`/api/clientes/${id}`);
                    this.render(container);
                }
            });
        });
    }
};
