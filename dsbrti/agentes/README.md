# Agentes DestinyServicesBR

**Versão do catálogo: 1.0.0 — 2026-11-19**

O arquivo [`manifest.json`](./manifest.json) é a fonte dos agentes integrados ao assistente local. Cada entrada define um identificador estável, nome, função e instruções enviadas como contexto do modelo. O workspace carrega esse catálogo em tempo de execução e o apresenta como somente leitura. A criação e a manutenção dos agentes oficiais são feitas neste diretório e versionadas com o repositório, não pelo site.

Agentes pessoais são uma opção separada e recolhida na aba **Agentes** das configurações. Eles ficam apenas no armazenamento local do navegador e não alteram este catálogo ou os arquivos do projeto.

## Agentes de produção e expansão

- **Manutenção** — análise de problemas, diagnóstico e propostas de correção.
- **Sexta-Feira** — criatividade e interação recreativa.
- **Jarvis** — assistência geral, organização e comandos em linguagem natural; não executa comandos do sistema.
- **Wanda** — revisão, síntese e organização das informações fornecidas.
- **E.D.I.T.H.** — orientação preventiva e defensiva de segurança digital.

Os agentes são perfis de instrução para o modelo, não processos autônomos. Eles não têm acesso ao sistema de arquivos, não executam ações e não enviam mensagens a terceiros.

## Convenções para novos agentes

1. Use um `id` permanente, exclusivo e sem dados pessoais.
2. Descreva o propósito em uma frase e instrua limites e capacidades reais.
3. Prefira respostas verificáveis e peça contexto quando houver ambiguidade.
4. Adicione a mudança ao histórico em [`../../docs/CHANGELOG.md`](../../docs/CHANGELOG.md).

## Integração futura com WhatsApp

O adaptador está documentado em [`integracoes/whatsapp.md`](./integracoes/whatsapp.md). Esta versão não conecta ao WhatsApp Web nem envia mensagens. Uma integração futura deverá usar uma interface oficial, consentimento por destinatário, revisão humana antes do envio e controles de privacidade, frequência e auditoria.
