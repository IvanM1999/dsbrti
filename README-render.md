# Configuração no Render

## 1) Criar banco PostgreSQL
- No Render, clique em New > PostgreSQL
- Escolha o plano gratuito
- Anote a URL de conexão gerada

## 2) Criar serviço Web
- New > Web Service
- Conecte este repositório
- Use o arquivo `render.yaml` para configurar o app
- O Render vai criar automaticamente o banco e as variáveis de ambiente

## 3) Variáveis obrigatórias
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_USER`
- `ADMIN_PASS_HASH`
- `DATABASE_URL`

## 4) Login do ERP
- E-mail: `dsbrti@dsbrti.com`
- Senha: `@Dsbrti2027`

## 5) Observação de segurança
- Nunca comitar o arquivo `.env`
- Sempre setar os valores no painel do Render
- O arquivo `.env.example` serve apenas como exemplo para dev/local

## Espaço de trabalho
- `/workspace.html` reúne o executor Web isolado e o assistente local opcional.
- O executor aceita somente HTTPS e usa `iframe sandbox`; sites que bloqueiam incorporação continuam abrindo apenas fora do painel.
- O assistente roda no navegador com Transformers.js e o modelo `onnx-community/Qwen2.5-0.5B-Instruct`. O modelo só é baixado depois do consentimento e fica no cache do navegador, não no Render.
- O download do modelo pode consumir aproximadamente 483 MB (WebGPU) ou 512 MB (CPU), além do runtime. A disponibilidade depende do navegador, hardware, conexão e cota de armazenamento.
- As conversas do assistente ficam em memória na página; não são enviadas a uma API de IA nem salvas pelo site.
