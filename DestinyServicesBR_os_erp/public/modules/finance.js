/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/modules/finance.js
   Controle Financeiro
   ============================================================ */

"use strict";

import { Utils } from '../utils.js';

export const Financeiro = {
    async render(container) {
        container.innerHTML = '<h2>Financeiro</h2><p>Carregando...</p>';

        try {
            const financeiro = await window.api.get('/api/financeiro');

            container.innerHTML = `
                <h2>Controle Financeiro</h2>
                <div class="card">
                    <h3>Novo Lançamento</h3>
                    <form id="form-finance">
                        <div class="form-group">
                            <label>Descrição</label>
                            <input type="text" id="fin-desc" required>
                        </div>
                        <div class="form-group">
                            <label>Valor (R$)</label>
                            <input type="number" step="0.01" id="fin-valor" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select id="fin-tipo" required>
                                <option value="receita">Receita</option>
                                <option value="despesa">Despesa</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Data</label>
                            <input type="date" id="fin-data" required>
                        </div>
                        <div style="width: 100%; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary">Salvar Lançamento</button>
                        </div>
                    </form>
                </div>
                <div class="card">
                    <h3>Extrato</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${financeiro.length > 0 ? financeiro.map(f => `
                                <tr>
                                    <td>${Utils.formatDate(f.data)}</td>
                                    <td>${Utils.escape(f.descricao)}</td>
                                    <td><span style="color: ${f.tipo === 'receita' ? '#27ae60' : '#c0392b'}; font-weight: bold; text-transform: capitalize;">${f.tipo}</span></td>
                                    <td>${Utils.formatCurrency(f.valor)}</td>
                                    <td>
                                        <button data-id="${f.id}" class="btn-danger btn-deletar-fin">Excluir</button>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="5">Nenhum lançamento encontrado.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;

            const dataInput = container.querySelector('#fin-data');
            if (dataInput) {
                dataInput.valueAsDate = new Date();
            }

            this.bindEvents(container);

        } catch (error) {
            console.error('[Financeiro Error]:', error);
            container.innerHTML = '<h2>Financeiro</h2><p>Erro ao carregar dados financeiros.</p>';
        }
    },

    bindEvents(container) {
        const form = container.querySelector('#form-finance');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await window.api.post('/api/financeiro', {
                    descricao: container.querySelector('#fin-desc').value,
                    valor: parseFloat(container.querySelector('#fin-valor').value),
                    tipo: container.querySelector('#fin-tipo').value,
                    data: container.querySelector('#fin-data').value
                });
                this.render(container);
            });
        }

        container.querySelectorAll('.btn-deletar-fin').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover este lançamento?')) {
                    await window.api.delete(`/api/financeiro/${id}`);
                    this.render(container);
                }
            });
        });
    }
};
