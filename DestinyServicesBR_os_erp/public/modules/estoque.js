/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/modules/estoque.js
   Gestão de Estoque
   ============================================================ */

"use strict";

import { Utils } from '../utils.js';

export const Estoque = {
    async render(container) {
        container.innerHTML = '<h2>Estoque</h2><p>Carregando...</p>';

        try {
            const estoque = await window.api.get('/api/estoque');

            container.innerHTML = `
                <h2>Gestão de Estoque</h2>
                <div class="card">
                    <h3>Adicionar Produto</h3>
                    <form id="form-estoque">
                        <div class="form-group">
                            <label>Nome do Produto</label>
                            <input type="text" id="prod-nome" required>
                        </div>
                        <div class="form-group">
                            <label>Quantidade</label>
                            <input type="number" id="prod-qtd" required min="0">
                        </div>
                        <div class="form-group">
                            <label>Preço Unitário (R$)</label>
                            <input type="number" step="0.01" id="prod-preco" required>
                        </div>
                        <div style="width: 100%; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary">Salvar Produto</button>
                        </div>
                    </form>
                </div>

                <div class="card">
                    <h3>Lista de Produtos</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Qtd</th>
                                <th>Preço</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${estoque.length > 0 ? estoque.map(p => `
                                <tr>
                                    <td>${p.id}</td>
                                    <td>${Utils.escape(p.nome)}</td>
                                    <td>${p.quantidade}</td>
                                    <td>${Utils.formatCurrency(p.preco)}</td>
                                    <td>
                                        <button data-id="${p.id}" class="btn-danger btn-deletar-prod">Excluir</button>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">Nenhum produto cadastrado.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;

            this.bindEvents(container);

        } catch (error) {
            console.error('[Estoque Error]:', error);
            container.innerHTML = '<h2>Estoque</h2><p>Erro ao carregar estoque.</p>';
        }
    },

    bindEvents(container) {
        const form = container.querySelector('#form-estoque');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await window.api.post('/api/estoque', {
                    nome: container.querySelector('#prod-nome').value,
                    quantidade: parseInt(container.querySelector('#prod-qtd').value, 10),
                    preco: parseFloat(container.querySelector('#prod-preco').value)
                });
                this.render(container);
            });
        }

        container.querySelectorAll('.btn-deletar-prod').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover este produto?')) {
                    await window.api.delete(`/api/estoque/${id}`);
                    this.render(container);
                }
            });
        });
    }
};
