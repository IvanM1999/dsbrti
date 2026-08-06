/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/modules/os.js
   Gestão Unificada de Ordens de Serviço e Orçamentos
   ============================================================ */

"use strict";

import { Utils } from '../utils.js';
import { PdfService } from '../services/pdf.js';

export const OS = {
    async render(container) {
        container.innerHTML = '<h2>Ordens de Serviço</h2><p>Carregando...</p>';

        try {
            const [listaOS, clientes] = await Promise.all([
                window.api.get('/api/os'),
                window.api.get('/api/clientes')
            ]);

            container.innerHTML = `
                <h2>Gestão de Ordens de Serviço</h2>
                
                <div class="card">
                    <h3>Nova Ordem de Serviço / Orçamento</h3>
                    <form id="form-os">
                        <div class="form-group">
                            <label>Cliente</label>
                            <select id="os-cliente" required>
                                <option value="">Selecione um cliente...</option>
                                ${clientes.map(c => `<option value="${c.id}" data-nome="${Utils.escape(c.nome)}">${Utils.escape(c.nome)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Equipamento / Item</label>
                            <input type="text" id="os-equipamento" placeholder="Ex: Notebook Asus i7" required>
                        </div>
                        <div class="form-group">
                            <label>Defeito Relatado / Serviço</label>
                            <input type="text" id="os-defeito" placeholder="Ex: Tela quebrada / Troca de fonte" required>
                        </div>
                        <div class="form-group">
                            <label>Valor Total (R$)</label>
                            <input type="number" step="0.01" id="os-valor" placeholder="0.00" required>
                        </div>
                        <div class="form-group">
                            <label>Garantia (Dias)</label>
                            <input type="number" id="os-garantia" value="90" required>
                        </div>
                        <div style="width: 100%; margin-top: 10px;">
                            <button type="submit" class="btn btn-primary">Abrir Ordem de Serviço</button>
                        </div>
                    </form>
                </div>

                <div class="card">
                    <h3>Histórico de Ordens de Serviço</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>OS nº</th>
                                <th>Cliente</th>
                                <th>Equipamento</th>
                                <th>Defeito</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${listaOS.length > 0 ? listaOS.map(os => `
                                <tr>
                                    <td>#${os.id}</td>
                                    <td>${Utils.escape(os.clienteNome || 'Cliente Removido')}</td>
                                    <td>${Utils.escape(os.equipamento)}</td>
                                    <td>${Utils.escape(os.defeito)}</td>
                                    <td>${Utils.formatCurrency(os.valorTotal)}</td>
                                    <td>
                                        <span class="status-badge ${os.status === 'concluido' ? 'status-concluido' : 'status-pendente'}">
                                            ${os.status ? os.status.toUpperCase() : 'PENDENTE'}
                                        </span>
                                    </td>
                                    <td>
                                        <button data-id="${os.id}" class="btn-secondary btn-imprimir-os" style="padding: 4px 8px; font-size: 0.8rem; margin-right: 5px;">PDF</button>
                                        <button data-id="${os.id}" class="btn-danger btn-deletar-os">Excluir</button>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="7">Nenhuma Ordem de Serviço cadastrada.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;

            this.bindEvents(container);

        } catch (error) {
            console.error('[OS Error]:', error);
            container.innerHTML = '<h2>Ordens de Serviço</h2><p>Erro ao carregar registros.</p>';
        }
    },

    bindEvents(container) {
        // Formulario de cadastro de OS
        const form = container.querySelector('#form-os');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const selectCliente = container.querySelector('#os-cliente');
                const clienteOpcao = selectCliente.options[selectCliente.selectedIndex];

                await window.api.post('/api/os', {
                    clienteId: selectCliente.value,
                    clienteNome: clienteOpcao.getAttribute('data-nome'),
                    equipamento: container.querySelector('#os-equipamento').value,
                    defeito: container.querySelector('#os-defeito').value,
                    valorTotal: parseFloat(container.querySelector('#os-valor').value),
                    garantiaDias: parseInt(container.querySelector('#os-garantia').value, 10),
                    data: new Date().toISOString().split('T')[0]
                });

                this.render(container);
            });
        }

        // Botão de Impressão / PDF
        container.querySelectorAll('.btn-imprimir-os').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = Number(e.target.getAttribute('data-id'));
                try {
                    const listaOS = await window.api.get('/api/os');
                    const osEncontrada = listaOS.find(o => Number(o.id) === id);
                    if (osEncontrada) {
                        PdfService.printOS(osEncontrada);
                    } else {
                        Utils.toast('Ordem de Serviço não encontrada para impressão.', 'error');
                    }
                } catch (err) {
                    console.error('[PDF Error]:', err);
                    Utils.toast('Erro ao gerar documento PDF.', 'error');
                }
            });
        });

        // Botão de Exclusão de OS
        container.querySelectorAll('.btn-deletar-os').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover esta Ordem de Serviço?')) {
                    await window.api.delete(`/api/os/${id}`);
                    this.render(container);
                }
            });
        });
    }
};
