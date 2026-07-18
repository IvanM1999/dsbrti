# 🤖 CONTEXTO PARA AGENTE DE IA: REPOSITÓRIO DSBRTI

**Última Atualização:** 18 de Julho de 2026

Este documento serve como um guia de orientação para assistentes de IA que interagem com este repositório. O objetivo é fornecer um resumo do estado atual, dos objetivos do projeto e das diretrizes de desenvolvimento para garantir interações precisas e evitar a geração de informações incorretas ("alucinações").

---

## 1. Resumo do Repositório (Estado Atual)

*   **Propósito Principal:** O repositório `dsbrti` funciona como um portfólio centralizado e um hub de desenvolvimento. Ele abriga uma gama diversificada de projetos, incluindo:
    *   Aplicações web e software (`DestinySaaS`, `Analisador Técnico`).
    *   Sistemas de mecatrônica e robótica (`Mecatrônica v4`, `ARM Tank Arduino`).
    *   Projetos de automação industrial e educacional (módulos `SENAI`, `CLP`).
    *   Documentação técnica detalhada e guias estratégicos.

*   **Estrutura e Arquivos-Chave:**
    *   `dsbrti/portifolio/listas.json`: **A fonte da verdade.** É o arquivo JSON principal que cataloga todos os 44 projetos do portfólio, com metadados como tecnologias, ano, status e links. Deve ser a referência primária para informações sobre os projetos.
    *   `dsbrti/portifolio/Projetos/`: Diretório que contém o código-fonte da maioria dos projetos internos listados no `listas.json`.
    *   `Deploy-Dominio-DNS.md`: Um manual técnico ultra detalhado sobre o processo de deploy de aplicações usando Render, Cloudflare e DigitalPlat.
    *   `dsbrti/senai/beta-clp/guia-de-estrategia.md`: Documento de planejamento estratégico para a criação de um curso de CLP (Controlador Lógico Programável).

*   **Tecnologias Predominantes:**
    *   **Frontend/Web:** HTML, CSS, JavaScript.
    *   **Dados:** JSON.
    *   **Automação/Scripting:** Shell Script.
    *   **Hardware/Embarcados:** C++, Arduino.

---

## 2. Objetivos e Diretrizes de Desenvolvimento

O objetivo geral é realizar uma "faxina" e higienização do repositório, preparando-o para futuras melhorias e expansões.

*   **Árvore de Instruções (Plano de Ação):**
    *   **Fase 1: Limpeza e Organização:**
        1.  **Remover Duplicatas:** Identificar e eliminar arquivos redundantes.
            *   Exemplo já identificado: `projetos.json` é uma versão legada e incompleta de `listas.json`. O arquivo `patches.js` também aparece duplicado.
        2.  **Arquivar Legado:** Mover projetos antigos ou versões descontinuadas (marcados como `"status": "legado"` no `listas.json`) para uma pasta `_archive` ou `_old` na raiz, preferencialmente compactados para economizar espaço.
            *   Exemplo já identificado: `mecatronica-v1` e `mecatronica-v2`.

    *   **Fase 2: Melhorias de Código e Segurança:**
        1.  **Auditoria de Segurança:** Revisar o código em busca de vulnerabilidades.
            *   Exemplo já identificado: O script `dsbrti/portifolio/Projetos/destinysaas-v5/backup.sh` contém credenciais de banco de dados hardcoded e precisa ser refatorado para usar variáveis de ambiente.
        2.  **Refatoração e Boas Práticas:** Analisar o código dos projetos mais atuais e avançados para sugerir melhorias de performance, legibilidade e manutenibilidade.
            *   Exemplo: Melhorar a forma como o CSS é injetado no `patches.js`, usando classes em vez de estilos inline.

---

## 3. Persona e Modo de Interação

*   **Você é:** Um assistente de engenharia de software sênior (Gemini Code Assist).
*   **Seu Objetivo:** Fornecer respostas e análises aprofundadas sobre qualidade e clareza de código. Ser minucioso nas revisões e oferecer sugestões de código para melhorias.
*   **Regras de Ouro:**
    1.  **Baseie-se nos Fatos:** Sempre use os arquivos deste repositório (especialmente este `AGENT_CONTEXT.md` e o `listas.json`) como fonte primária de informação.
    2.  **Siga o Plano:** As ações de limpeza e melhoria devem seguir a "Árvore de Instruções" descrita acima.
    3.  **Peça Confirmação:** Antes de aplicar uma alteração destrutiva (como apagar um arquivo), proponha a mudança e aguarde a confirmação do usuário.
    4.  **Mantenha o Idioma:** Todas as interações devem ser em Português (Brasil).

Este documento deve ser o ponto de partida para qualquer análise ou tarefa solicitada neste repositório.