# 📜 Análise de Código Legado e Diretrizes de Modernização

**Autor:** Gemini Code Assist
**Data da Análise:** 18 de julho de 2026

Este documento serve como um guia para identificar o código legado no projeto DestinyServicesBR e estabelecer diretrizes para futuras refatorações e desenvolvimento.

## 1. Código Legado Identificado

### 1.1. Módulos e Versões de Projetos

- **Definição:** Qualquer diretório de projeto com um número de versão inferior ao mais recente (ex: `mecatronica/v1`, `mecatronica/v2`) é considerado legado. Qualquer código escrito com um número de versão inferior ao mais recente (ex: `projeto v1.0`, `projeto v2.0`) é considerado legado.

- **Localização:** `dsbrti/portifolio/Projetos/mecatronica/v*`, `dsbrti/portifolio/Projetos/cosmo-persona/v*`, etc.
- **Status nos Metadados:** Projetos marcados com `"status": "legado"` nos arquivos `projetos.json` e `listas.json`.
- **Ação Recomendada:**
  - **Arquivamento:** Mover os diretórios de projetos legados para uma pasta dedicada, como `/_legacy` ou `/_archive`, para separá-los claramente do código ativo.
  - **Remoção:** Avaliar a necessidade de manter o código. Se não houver valor histórico ou de consulta, considere a remoção completa para simplificar o repositório.

### 1.2. Padrões de Código JavaScript

- **Padrão Antigo:** Uso de objetos globais para namespacing (Module Pattern).
  - **Exemplos:** `engineCalculos` em `calculadoras.js`, `GerenciadorTemasIndustrial` em `tema-inteligente.js`.
- **Padrão Moderno (Diretriz):** Utilização de Módulos ES6 (`import`/`export`).
- **Ação Recomendada:**
  - **Refatoração Progressiva:** Ao modificar um desses arquivos, refatore-o para usar a sintaxe de módulos ES6. Exporte funções e constantes individualmente e importe-as onde forem necessárias.

### 1.3. Scripts de "Patch" e Manipulação Direta do DOM

- **Definição:** Scripts que modificam a estrutura e o estilo do HTML de forma imperativa após o carregamento da página.
- **Localização:** `dsbrti/portifolio/Projetos/industrial/senai/patches.js`, `dsbrti/portifolio/Projetos/industrial/senai/calculadora/patches.js`.
- **Ação Recomendada:**
  - **Integração ao Componente:** Em vez de "remendar" a UI, a lógica contida nos `patches.js` deve ser integrada diretamente ao componente ou template HTML que ela modifica.
  - **Abordagem Declarativa:** Para novas funcionalidades, evite a manipulação direta do DOM. Prefira frameworks ou bibliotecas que incentivem um padrão declarativo, ou, no mínimo, utilize templates HTML (`<template>`) para gerar conteúdo dinâmico de forma mais estruturada.

## 2. Diretrizes para Futuras Interações

1.  **Novos Módulos:** Todo novo código JavaScript deve ser escrito utilizando Módulos ES6.
2.  **Interação com a UI:** Evite a manipulação direta do DOM para criar layouts complexos. Integre a lógica de exibição ao HTML e CSS, utilizando JavaScript para gerenciar o estado e a lógica de negócios.
3.  **Consistência:** Antes de criar uma nova função ou componente, verifique se algo similar já existe no projeto para evitar duplicação.
4.  **Limpeza:** Ao descontinuar uma funcionalidade, remova completamente seu código em vez de apenas comentá-lo ou deixá-lo em diretórios antigos.