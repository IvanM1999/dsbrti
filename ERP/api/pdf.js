/* ============================================================
   pdf.js
   DestinyServices OS
   Impressão e Exportação PDF
   ============================================================ */

"use strict";

const PDF = (() => {
            
            function print(elementId = "print-area") {
                
                window.print();
                
            }
            
            function open(html) {
                
                const popup = window.open(
                    
                    "",
                    
                    "_blank",
                    
                    "width=900,height=700"
                    
                );
                
                popup.document.open();
                
                popup.document.write(`

<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<title>Orçamento</title>

<link rel="stylesheet" href="style.css">

</head>

<body>

${html}

<script>

window.onload=()=>window.print();

</script>

</body>

</html>

`);
                
                popup.document.close();
                
            }
            
            function budget(budget) {
                
                return `

<div class="document">

<div class="header-card">

<div>

<h1 class="doc-title">

ORÇAMENTO

</h1>

<p>

${budget.company || ""}

</p>

</div>

<div>

<strong>

${budget.number}

</strong>

<br>

${new Date(

budget.createdAt

).toLocaleDateString("pt-BR")}

</div>

</div>

<div class="info-grid">

<div class="info-box">

<h3>Cliente</h3>

<p>${Utils.escape(budget.client)}</p>

</div>

<div class="info-box">

<h3>Equipamento</h3>

<p>${Utils.escape(budget.equipment)}</p>

</div>

</div>

<table class="table-data">

<thead>

<tr>

<th>Descrição</th>

<th>Qtd</th>

<th>Valor</th>

<th>Total</th>

</tr>

</thead