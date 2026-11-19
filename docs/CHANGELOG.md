# Histórico de documentação e produto

As alterações relevantes de produto, arquitetura e documentação são registradas aqui em ordem cronológica inversa. Cada entrada identifica a versão, a data e o escopo; os documentos de referência mantêm sua própria versão no cabeçalho quando aplicável.

## Política de versionamento

- Usar `MAJOR.MINOR.PATCH` para documentos com cabeçalho de versão: mudança incompatível de estrutura/contrato, adição compatível ou correção editorial, respectivamente.
- Registrar mudanças de produto e arquitetura neste histórico com data ISO (`AAAA-MM-DD`).
- Não sobrescrever versões publicadas de contratos externos; registrar mudanças e migrações necessárias.
- Manter instruções de agentes e contratos de integração versionados junto ao código que os consome.

## Entradas

### 2026-11-19 — 0.2.0

- Reorganizada a configuração de IA em abas separadas para modelos e agentes.
- Catálogo oficial apresentado como somente leitura; criação de agentes pessoais movida para uma seção recolhida.

### 2026-11-19 — 0.1.0

- Criado o catálogo de agentes locais selecionáveis e suporte a agentes personalizados no navegador.
- Adicionado seletor de modelos locais, chat flutuante com estado e histórico persistidos localmente.
- Documentada a expansão futura para WhatsApp sem conexão ou envio ativo.
