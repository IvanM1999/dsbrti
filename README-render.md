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
