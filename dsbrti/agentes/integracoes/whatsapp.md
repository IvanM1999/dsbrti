# Expansão futura: integração com WhatsApp

**Documento: 1.0.0 — 2026-11-19**

## Estado

Somente base de arquitetura. Não existe conexão, leitura de conversas, automação de navegador ou envio de mensagens nesta versão.

## Direção proposta

- Integrar por APIs oficiais e autorizadas, nunca por scraping ou automação não oficial do WhatsApp Web.
- Manter credenciais e tokens no servidor, fora do navegador, do repositório e dos prompts dos agentes.
- Exigir que a pessoa conecte a própria conta e autorize cada finalidade de uso.
- Exigir confirmação humana para mensagens geradas por agentes; não enviar mensagens autônomas em lote.
- Respeitar opt-in do destinatário, opt-out, limites do provedor, janela de atendimento e políticas aplicáveis.
- Registrar consentimento, autor, agente, conteúdo aprovado, horário e resultado sem reter dados além do necessário.
- Isolar por usuário as credenciais, conversas, histórico e fila de mensagens; oferecer desconexão e exclusão.
- Tratar mensagens recebidas como conteúdo não confiável. Elas não podem alterar instruções do agente nem autorizar ações por si mesmas.

## Contrato de expansão

Uma implementação futura pode separar os componentes abaixo atrás de uma API autenticada:

1. **Connection provider** — inicia, verifica e encerra uma conexão oficial autorizada.
2. **Agent runner** — recebe uma mensagem e um agente selecionado, com permissões explícitas e contexto minimizado.
3. **Approval queue** — apresenta a resposta sugerida, destinatário e agente para aprovação humana.
4. **Message sender** — envia apenas a versão aprovada, com deduplicação, limites e registro do resultado.
5. **Webhook receiver** — valida assinatura, origem, repetição e estrutura dos eventos recebidos.

Antes de habilitar envios, definir autenticação, autorização por usuário, retenção, gestão de segredos, auditoria, idempotência e procedimento de revogação. Nenhum agente deve receber permissão implícita de envio.
