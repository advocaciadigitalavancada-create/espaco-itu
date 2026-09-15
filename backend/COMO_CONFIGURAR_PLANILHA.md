# 🍕 Espaço Itu — Guia Rápido de Configuração do Backend Serverless (Google Sheets + Apps Script)

Este manual executivo orienta a equipe da **WorkAround TI** e os proprietários do **Espaço Itu** na ativação da API Serverless no Google Sheets em **menos de 5 minutos**.

---

## 📌 Dados Mestres do Negócio
- **Estabelecimento:** Espaço Itu — Pizza Artesanal 48h & Café Especial
- **Endereço:** Rodovia Dr. Antônio Luiz Moura Gonzaga, 1895 — Rio Tavares, Florianópolis - SC
- **WhatsApp Oficial / Balcão:** +55 (48) 98860-5923
- **Instagram Oficial:** [@espaco.itu](https://instagram.com/espaco.itu)
- **PIN Padrão de Segurança:** `4895` (DDD 48 + Moura Gonzaga 1895)

---

## ⚡ Passo a Passo de Ativação (Tempo Estimado: 4 minutos)

### 1. Criar a Planilha no Google Drive
1. Acesse [sheets.new](https://sheets.new) ou seu Google Drive.
2. Nomeie a planilha como: **`Espaço Itu — Gestão de Cardápios`**.

---

### 2. Acessar o Editor do Google Apps Script
1. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
2. Na aba que abrir, renomeie o projeto no topo para: **`Espaço Itu API`**.

---

### 3. Colar o Código do Backend
1. No editor de código, apague o conteúdo existente em `Código.gs` (ou `Code.gs`).
2. Abra o arquivo `backend/Code.gs` do projeto e copie **todo o código**.
3. Cole o código no editor e salve (`Ctrl + S` ou ícone de disquete).

---

### 4. Gerar Automaticamente as 4 Abas com Dados Reais
1. Na barra superior do editor, na caixa de seleção de funções, escolha **`setupInitialSheets`**.
2. Clique em **Executar**.
3. O Google pedirá permissões de acesso:
   - Clique em **Revisar permissões**.
   - Escolha sua conta Google.
   - Clique em **Avançado** (Advanced) e em **Acessar Espaço Itu API (não seguro)**.
   - Clique em **Permitir**.
4. Volte à aba da sua planilha no Google Sheets: você verá as 4 abas estruturadas e formatadas com cores temáticas:
   - **`Config`** (Cinza escuro): Telefone oficial, horários de café e pizza, status geral.
   - **`CafeManha`** (Marrom café): Cafés especiais, croissant folhado, torta basca, brunch.
   - **`PizzasNoite`** (Vermelho terracota): Pizza de salmão, margherita 48h, parma com rúcula.
   - **`Avisos`** (Âmbar/dourado): Avisos sobre fornadas da massa 48h e comunicados.

---

### 5. Publicar como Web App (API Aberta)
1. No canto superior direito, clique em **Implantar** (Deploy) > **Nova implantação**.
2. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e selecione **App da Web** (Web App).
3. Preencha:
   - **Descrição:** `API Oficial Espaço Itu v1`
   - **Executar como:** `Eu (seu-email@gmail.com)`
   - **Quem pode acessar:** `Qualquer pessoa` *(Essencial para que o site e o painel consultem sem travas de login)*.
4. Clique em **Implantar**.
5. Copie a **URL do app da Web** gerada (`https://script.google.com/macros/s/.../exec`).

---

### 6. Conectar ao Painel da Vitrine Digital
1. No painel de administração ou configuração da vitrine, cole a URL copiada.
2. O sistema passará a ler e atualizar o cardápio automaticamente.
3. Para gravação ou troca rápida de status (*Disponível*, *Esgotado*, *Destaque do Dia*), utilize o PIN seguro: **`4895`**.

---

## 🏷️ Controle de Status dos Itens da Planilha
Na coluna **Status** das abas `CafeManha` e `PizzasNoite`:
- `Disponível`: Exibido normalmente no cardápio com botão direto de pedido no WhatsApp.
- `Esgotado`: Exibe badge de "Esgotado hoje" e desabilita pedidos daquele sabor/item.
- `Destaque do Dia`: Ganha destaque no topo da seção e badge dourado de recomendação do chef.

---

## 🔒 Segurança e Suporte
- As consultas públicas GET são rápidas, em formato JSON nativo e cacheadas.
- O endpoint POST bloqueia qualquer alteração que não apresente o PIN `4895`.
- Em caso de dúvidas técnicas, acione o time de engenharia da **WorkAround TI**.
