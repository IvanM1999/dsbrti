/* ============================================================
   Caminho: DestinyServicesBR_os_erp/public/services/pdf.js
   Gerador de Vias de Impressão e PDF para Ordens de Serviço
   ============================================================ */

"use strict";

import { Utils } from '../utils.js';

export const PdfService = {
    printOS(osData) {
        const empNome = localStorage.getItem('cfg_empresa_nome') || 'DestinyServices BR';
        const empCnpj = localStorage.getItem('cfg_empresa_cnpj') || '';
        const empTelefone = localStorage.getItem('cfg_empresa_telefone') || '';
        const empEndereco = localStorage.getItem('cfg_empresa_endereco') || '';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, permita pop-ups para gerar o documento.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Ordem de Serviço #${osData.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.5; }
                    .header { border-bottom: 2px solid #2c3e50; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
                    .header h1 { margin: 0; color: #2c3e50; font-size: 1.5rem; }
                    .header p { margin: 2px 0; font-size: 0.9rem; }
                    .box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
                    .box h3 { margin-top: 0; color: #2c3e50; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .total { text-align: right; font-size: 1.3rem; font-weight: bold; margin-top: 15px; }
                    .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
                    .sig-line { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-size: 0.85rem; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>${Utils.escape(empNome)}</h1>
                        <p>${Utils.escape(empCnpj)}</p>
                        <p>${Utils.escape(empEndereco)}</p>
                        <p>${Utils.escape(empTelefone)}</p>
                    </div>
                    <div style="text-align: right;">
                        <h2>ORDEM DE SERVIÇO</h2>
                        <p><strong>Nº:</strong> #${osData.id}</p>
                        <p><strong>Data:</strong> ${Utils.formatDate(osData.data)}</p>
                    </div>
                </div>

                <div class="box">
                    <h3>Dados do Cliente</h3>
                    <p><strong>Nome:</strong> ${Utils.escape(osData.clienteNome || 'Não informado')}</p>
                </div>

                <div class="box">
                    <h3>Detalhamento do Serviço</h3>
                    <p><strong>Equipamento / Item:</strong> ${Utils.escape(osData.equipamento)}</p>
                    <p><strong>Defeito / Serviço Solicitado:</strong> ${Utils.escape(osData.defeito)}</p>
                    <p><strong>Garantia Estipulada:</strong> ${osData.garantiaDias || 90} dias</p>
                </div>

                <div class="total">
                    Valor Total: ${Utils.formatCurrency(osData.valorTotal)}
                </div>

                <div class="signatures">
                    <div class="sig-line">Assinatura do Técnico / Prestador</div>
                    <div class="sig-line">Assinatura do Cliente</div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    }
};
