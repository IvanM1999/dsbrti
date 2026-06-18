
# 📑 MANUAL TÉCNICO ULTRA DETALHADO: DEPLOY E APONTAMENTO DE DOMÍNIO
**Autor:** Infra & Dev Team
**Plataformas:** Render (Hospedagem) | Cloudflare (DNS/Segurança) | DigitalPlat (Registrador)
## 📦 CAPÍTULO 1: O PONTO DE PARTIDA (O CÓDIGO E O RENDER)
O Render hospeda aplicações usando isolamento por containers. Para subir APIs ou sites dinâmicos de graça, usamos a opção **Web Service**.
### Passo 1.1: Autenticação Segura via Git
 1. Acesse o site oficial: [https://dashboard.render.com](https://dashboard.render.com).
 2. Na tela de login/cadastro, **não utilize e-mail e senha manuais**. Clique no botão **Sign up with GitHub** (ou GitLab).
 3. Uma janela pop-up do seu provedor Git será aberta solicitando autorização. Clique em **Authorize Render**.
 4. *Por que fazemos isso?* Isso ativa o *Continuous Deployment* (CD). Toda vez que você rodar um git push origin main na sua máquina, o Render detectará a alteração e atualizará o site sozinho.
### Passo 1.2: Inicializando o Web Service
 1. No painel principal do Render, clique no botão azul localizado no topo superior direito escrito **New +**.
 2. No menu suspenso que aparecer, clique na primeira opção: **Web Service**.
 3. Na tela seguinte, você verá um campo de busca chamado *Connect a repository*. O Render listará todos os seus repositórios do GitHub.
 4. Encontre o repositório do seu projeto. Caso ele não apareça, clique em *Configure GitHub App* para dar permissão à pasta correta.
 5. Clique no botão azul **Connect** ao lado do nome do repositório escolhido.
### Passo 1.3: Preenchimento de Parâmetros de Tela (Campo por Campo)
Você será enviado para a tela de configuração técnica do container. Preencha exatamente assim:
 * **Name:** Digite o nome do seu projeto (use apenas letras minúsculas, números e hífens. Ex: meu-sistema-api).
 * **Region:** Selecione **Ohio (US East)** ou **Frankfurt (EU Central)**. São as regiões com melhor latência para o plano gratuito.
 * **Branch:** Selecione a branch principal do seu Git (geralmente main ou master).
 * **Runtime:** Aqui você define a tecnologia do seu projeto. Siga a regra abaixo baseada no seu código:
#### A) Se o projeto for Node.js / JavaScript Backend:
 * **Runtime:** Selecione Node
 * **Build Command:** npm install (Instala as dependências do package.json)
 * **Start Command:** npm start (Ou node index.js, dependendo de como está seu script de inicialização)
#### B) Se o projeto for Python (Flask, Django, FastAPI):
 * **Runtime:** Selecione Python
 * **Build Command:** pip install -r requirements.txt
 * **Start Command:** gunicorn app:app (Se usar Flask/Django) ou uvicorn main:app --host 0.0.0.0 --port $PORT (Se usar FastAPI)
#### C) Se o projeto for PHP (Importante para o Plano Gratuito):
O Render não possui suporte nativo (Runtime) para PHP no plano gratuito. Para rodar PHP de graça, precisamos usar **Docker**.
 1. No seu código, crie um arquivo chamado exatamente Dockerfile (sem extensão) na raiz do projeto.
 2. Cole o seguinte conteúdo técnico dentro dele:
```dockerfile
FROM php:8.2-apache
COPY . /var/www/html/
RUN a2enmod rewrite
EXPOSE 80

```
 3. Na tela do Render, mude o **Runtime** para Docker.
 4. Os campos *Build Command* e *Start Command* sumirão, pois o Render lerá as instruções direto do seu arquivo Dockerfile.
### Passo 1.4: Seleção de Plano e Variáveis de Ambiente
 1. Role a tela para baixo até a seção de preços. Certifique-se de marcar a bola correspondente ao plano **Free ($0/month)**.
 2. Se o seu projeto precisa se conectar a um banco de dados ou usa chaves secretas, role mais um pouco e clique no botão **Advanced**.
 3. Clique em **Add Environment Variable**:
   * No campo Key, digite o nome da variável (Ex: DATABASE_URL).
   * No campo Value, cole o valor da conexão.
 4. **Tratamento de Porta no Código:** O Render vai injetar uma porta dinâmica no seu projeto. Garanta que seu código Node/Python escute a porta usando a variável process.env.PORT (Node) ou os.environ.get('PORT') (Python). No PHP com Docker, a porta 80 padrão já é mapeada automaticamente pelo Render.
 5. Role até o final e clique no botão azul **Create Web Service**.
### Passo 1.5: Monitorando o Primeiro Deploy
 1. Você será jogado em uma tela preta com linhas de comando subindo em tempo real (Logs).
 2. Aguarde até que a linha final exiba a seguinte mensagem: Your service is live 🎉.
 3. No topo esquerdo da tela, abaixo do nome do seu projeto, haverá um link azul claro terminando em .onrender.com. Clique nele para testar se a aplicação abre corretamente. Copie esse link.
## 🌐 CAPÍTULO 2: CONSEGUINDO O DOMÍNIO (DIGITALPLAT)
### Passo 2.1: Localizando a Área de Servidores de Nome
 1. Abra uma nova aba no navegador e acesse: [https://dash.domain.digitalplat.org/dashboard](https://dash.domain.digitalplat.org/dashboard).
 2. No menu lateral esquerdo, localize o ícone de globo e clique em **Lista de domínios**.
 3. Na tabela que carregar no centro da tela, localize o seu domínio (Ex: dsbrti.qzz.io) e clique diretamente sobre o nome dele.
 4. A tela de gerenciamento específico do domínio será aberta. Role totalmente para baixo até encontrar um submenu horizontal com as abas: Nameservers, Renew, WHOIS Privacy, Delete.
 5. Clique na aba **Nameservers**.
 6. Você verá campos de texto editáveis chamados * NAME SERVER 1 e * NAME SERVER 2. Deixe essa tela aberta e passe para o próximo capítulo.
## 🛡️ CAPÍTULO 3: O INTERMEDIÁRIO INTELIGENTE (CLOUDFLARE)
Como a DigitalPlat não possui um editor de tabelas DNS avançado, usamos a Cloudflare para criar as regras de direcionamento de tráfego.
### Passo 3.1: Mapeamento do Domínio
 1. Acesse [https://dash.cloudflare.com/](https://dash.cloudflare.com/) e faça login ou crie sua conta.
 2. Na tela inicial do painel da Cloudflare, clique no botão azul **Adicionar um site** (ou *Add a site*).
 3. No campo de texto, digite seu domínio limpo, sem http ou www. Exemplo: dsbrti.qzz.io. Clique em **Continuar**.
 4. A tela seguinte mostrará uma tabela de preços. **Não clique nas opções pagas**. Role a página até o final, encontre a opção **Plano Gratuito (Free / $0)**, selecione o quadrante e clique em **Continuar**.
### Passo 3.2: Criação Rigorosa dos Registros DNS
A Cloudflare passará alguns segundos escaneando o domínio e abrirá a tela **"Revise seus registros de DNS"**. Se houver registros antigos ali, clique em "Excluir" em todos para evitar conflitos. Deixe a lista limpa.
Agora, crie os dois registros obrigatórios clicando no botão azul **Adicionar registro** (*Add record*):
#### Registro 1: O Domínio Principal (Raiz)
 * **Tipo (Type):** Clique e mude para A.
 * **Nome (Name):** Digite apenas o caractere @ (O sistema entenderá automaticamente como dsbrti.qzz.io).
 * **Endereço IPv4 (IPv4 address):** Digite exatamente o IP do Render: 216.24.57.1.
 * **Status do Proxy:** **Este é o ponto mais importante de todo o processo.** Você verá o desenho de uma nuvem laranja ligada. **Clique em cima dela para desativá-la**. Ela deve ficar **Cinza** e o texto ao lado deve mudar para **"Somente DNS" (DNS Only)**.
 * Clique no botão azul **Salvar**.
#### Registro 2: O Subdomínio (WWW)
 * Clique novamente no botão azul **Adicionar registro**.
 * **Tipo (Type):** Clique e mude para CNAME.
 * **Nome (Name):** Digite exatamente www.
 * **Destino (Target):** Cole a URL do Render que você copiou no Passo 1.5 (Ex: seu-app.onrender.com). *Atenção: remova o https:// do início e a barra / do final se existirem.*
 * **Status do Proxy:** Assim como no Registro 1, **clique na nuvem laranja para que ela fique Cinza (Somente DNS)**.
 * Clique no botão azul **Salvar**.
Confira se os dois registros aparecem na tabela abaixo do botão de busca, exatamente com as nuvens cinzas ativadas. Se estiver correto, clique no botão azul no rodapé da página: **Continue para ativação**.
## 🔗 CAPÍTULO 4: CONECTANDO AS PONTAS (A VIRADA DE CHAVE)
### Passo 4.1: Sincronização de Autoridade de DNS
 1. Na tela que se abriu na Cloudflare, role até o item **"2. Substitua os servidores de nome atuais..."**.
 2. Você verá duas caixas de texto com o símbolo da nuvem da Cloudflare contendo os novos endereços DNS gerados para você. Exemplo:
   * ansem.ns.cloudflare.com
   * leah.ns.cloudflare.com
 3. Copie o primeiro endereço completo.
 4. Alterne para a aba do navegador onde está o painel da **DigitalPlat** (na seção de Nameservers que localizamos no Passo 2.1).
 5. Apague qualquer texto que estiver dentro do campo **NAME SERVER 1** e cole o primeiro link da Cloudflare (ansem.ns.cloudflare.com).
 6. Apague o texto do campo **NAME SERVER 2** e cole o segundo link da Cloudflare (leah.ns.cloudflare.com).
 7. **Muito importante:** Se os campos NAME SERVER 3 até o 8 possuírem qualquer caractere ou texto genérico (como "NS3", "NS4"), selecione e **apague tudo**, deixando-os totalmente vazios.
 8. Clique no botão azul **Update** no canto inferior direito da tela da DigitalPlat.
 9. Volte para a aba da Cloudflare e clique no botão **Verificar servidores de nome** (Check nameservers).
## 🚀 CAPÍTULO 5: FINALIZANDO NO RENDER (O AJUSTE FINO)
### Passo 5.1: Vinculando o Domínio Customizado
 1. Volte ao painel do **Render** onde seu Web Service está rodando.
 2. No menu lateral esquerdo da aplicação, clique na engrenagem **Settings** (Configurações).
 3. Role a página central para baixo até localizar a seção chamada **Custom Domains**.
 4. Clique no botão **Add Custom Domain**.
 5. No campo de texto, digite seu domínio limpo (Ex: dsbrti.qzz.io) e clique em **Save**.
 6. A tela mostrará os dados de verificação. Clique no botão **Verify** ou **Retry Verification**.
 7. A linha **VERIFIED STATUS** mudará imediatamente ou em poucos minutos para um bloco verde escrito **Verified**.
### Passo 5.2: Lidando com a Janela de Propagação do SSL
Logo abaixo do status de verificado, você verá o campo **CERTIFICATE STATUS** exibindo um bloco marrom ou vermelho escrito **Certificate Error**.
 * **O que isso significa?** Para o seu site ter o cadeado de segurança (https://), o Render emite um certificado digital via *Let's Encrypt*. Como os Nameservers acabaram de ser trocados na DigitalPlat, os computadores centrais da internet ainda estão atualizando a rota. O emissor tenta acessar seu domínio e não o encontra no lugar certo de imediato.
 * **Como proceder:** **Não altere nenhuma configuração.** O processo agora é 100% automático. O Render realiza novas tentativas de varredura a cada 5 ou 10 minutos por padrão.
 * **Ação:** Feche os painéis ou faça uma pausa de **15 a 30 minutos**. Ao retornar e atualizar a página do Render, o bloco mudará para a cor verde com o status escrito **Issued** ou **Active**.
Pronto! Seu sistema está oficialmente publicado sob uma arquitetura de nível de produção, com proteção de borda e certificado de criptografia renovado automaticamente e de forma vitalícia sem custos.
