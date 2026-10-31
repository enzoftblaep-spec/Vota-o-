# Recon map — n8n (automação de workflows)

> Fase 1 do pack Replica (`/replica-recon`). Data: 2026-10-31.
> Reconstrução **clean-room**: funcionalidade e padrões de UX. Nada de código,
> logo, nome, ícones ou textos do n8n entra no clone.

---

## 1. Escopo

| pergunta | resposta proposta |
| --- | --- |
| App / plataforma | n8n, **web** (editor no navegador + servidor que executa os fluxos). |
| Fatia | **O loop principal**: montar um workflow num canvas de nós → conectar credenciais → disparar (manual, webhook, agendamento) → ver a execução, nó a nó, com os dados que passaram. Ficam de fora: multi-ambiente, SSO, Git, marketplace de templates. |
| Para quem | Pequenos negócios brasileiros (clínicas, infoprodutores, lojas) que querem automatizar WhatsApp/Telegram, agenda, planilhas e pagamentos sem programar. Interface em PT-BR. Uso próprio primeiro (clínica + Enzin VIP), produto depois. |

### ⚠️ Licença e termos — leia antes de construir

- O código do n8n é *source-available* sob a **Sustainable Use License**
  (não é open source). Ela restringe o uso a fins internos e proíbe vender um
  produto/serviço cujo valor venha "inteira ou substancialmente" da
  funcionalidade do n8n. Arquivos `.ee.` estão sob uma licença Enterprise
  ainda mais restrita.
- **Consequência para o clone:** nenhum arquivo, trecho ou estrutura copiada do
  repositório do n8n. Escrevemos tudo do zero a partir do comportamento
  observável e da documentação pública. Também não usamos o nome "n8n", o
  logo, os ícones dos nós nem os textos da interface.
- Um "editor de fluxos com nós" é um padrão genérico (Node-RED, Make,
  Zapier, Activepieces, Pipedream, Windmill). Ideias e fluxos de UX não são
  protegidos; código e marca são.
- Se a usuária tiver conta no n8n Cloud, os termos de uso dela podem vedar
  usar a conta para construir concorrente → **trabalhamos só de fontes
  públicas**.
- Este documento não é parecer jurídico.

---

## 2. Fontes

> Nesta sessão, `n8n.io` e `docs.n8n.io` estão **bloqueados pela política de
> rede**. As linhas marcadas "pendente" precisam ser lidas depois de liberar
> esses domínios nas configurações de rede do ambiente (ou lidas pela usuária
> no navegador dela). O restante vem de buscas públicas e do conhecimento
> público e documentado do produto.

| fonte | URL | o que dá | status |
| --- | --- | --- | --- |
| Docs (central de ajuda) | https://docs.n8n.io/ | lista completa de recursos e configurações | pendente (bloqueado) |
| Docs — workflows | https://docs.n8n.io/workflows/ | editor, execuções, configurações, compartilhamento | pendente |
| Docs — expressões | https://docs.n8n.io/code/expressions/ | sintaxe `{{ }}`, variáveis `$json`, `$node` | pendente |
| Docs — licença | https://docs.n8n.io/sustainable-use-license/ | regras da Sustainable Use License | lido via busca |
| Página de preços | https://n8n.io/pricing/ | o que é pago (execuções, concorrência, SSO, ambientes) | lido via resumos de terceiros |
| Resumo de preços 2026 | https://toolradar.com/blog/n8n-pricing-2026 | Starter/Pro/Business/Enterprise | lido |
| Resumo de preços 2026 | https://www.jetadmin.io/blog/n8n-pricing/ | limites de execução, overage | lido |
| Guia de licença | https://www.activepieces.com/blog/n8n-sustainable-use-license-commercial-use-2026-guide | interpretação comercial da licença | lido |
| Changelog / release notes | https://docs.n8n.io/release-notes/ | o que foi adicionado recentemente | pendente |
| API pública | https://docs.n8n.io/api/ | modelo de dados (workflows, executions, credentials, tags, users) | pendente |
| Galeria de templates | https://n8n.io/workflows/ | formato dos workflows e casos de uso populares | pendente |
| Vídeos de walkthrough | YouTube "n8n tutorial" | fluxos clique a clique | a assistir (humano) |

### Preços do original (base para o `/replica-launch`)

| plano | preço (≈) | execuções/mês | concorrência | destaque |
| --- | --- | --- | --- | --- |
| Community (self-host) | grátis | ilimitado | — | sem SSO, sem ambientes |
| Starter (cloud) | €20–24/mês | 2.500 | 5 | pausa ao estourar |
| Pro (cloud) | €50–60/mês | 10.000 | 20 | insights, mais histórico |
| Business | €667–800/mês | 40.000 | 30 | SSO, Git, ambientes |
| Enterprise | sob consulta | custom | 200+ | audit log, SLA, log streaming |

Fontes discordam sobre limite de workflows ativos (alguns dizem que foi removido
em 2026). **O que eles cobram = o que importa**: volume de execuções,
concorrência, colaboração e governança.

---

## 3. Inventário de telas

| ID | tela | rota / como chegar | propósito | componentes-chave | estados |
| --- | --- | --- | --- | --- | --- |
| S01 | Login / cadastro | `/signin`, `/signup` | entrar no workspace | form, botão, link "esqueci a senha" | vazio, erro, carregando |
| S02 | Setup do dono | primeiro acesso | criar conta admin | form | vazio, erro |
| S03 | Visão geral (home) | `/home/workflows` | lista de workflows | sidebar, tabela/cards, busca, filtro por tag, botão "Criar workflow", toggle ativo | **vazio** (CTA "comece do zero / use um template"), cheio, carregando |
| S04 | Editor de workflow (canvas) | `/workflow/:id` | montar o fluxo | canvas com zoom/pan, nós, conexões, mini-toolbar, botão "+", botão "Executar workflow", toggle Ativo, Salvar, nome editável, tags | **vazio** ("adicione o primeiro passo"/trigger), editando, executando (nó girando), sucesso (✓ verde nos nós + contagem de itens nas arestas), erro (nó vermelho), não salvo |
| S05 | Painel de nós (node creator) | botão "+" ou Tab no canvas | escolher trigger/ação | painel lateral com busca, categorias (Triggers, AI, App, Dados, Fluxo, Core), lista de ações por app | busca vazia, sem resultado |
| S06 | Detalhe do nó (NDV) | duplo clique num nó | configurar parâmetros e testar | 3 colunas: **Input** (tabela/JSON/schema) · **Parâmetros** · **Output**; botão "Testar passo"; aba Settings; arrastar campo do input para o parâmetro gera expressão | sem input ainda, com dados, erro de execução, dados fixados (pinned) |
| S07 | Editor de expressão | clicar "expressão" num campo | escrever `{{ }}` com preview | editor de código com autocomplete, preview do resultado | válido, erro, resultado vazio |
| S08 | Editor de código | nó Code | JS (e Python) | editor com realce, autocomplete | erro de sintaxe, erro em runtime |
| S09 | Credenciais (lista) | `/home/credentials` | gerenciar contas conectadas | tabela, busca, botão "Criar credencial" | vazio, cheio |
| S10 | Modal de credencial | criar/editar | conectar app (API key ou OAuth2) | form dinâmico por tipo, botão "Conectar com Google", "Testar" | conectando, sucesso, falha de teste |
| S11 | Execuções (lista) | `/home/executions` e aba "Execuções" do workflow | histórico | tabela: status, início, duração, modo (manual/trigger/webhook), filtros, botão "repetir" | vazio, rodando, sucesso, erro, esperando (wait) |
| S12 | Detalhe da execução | clicar numa execução | ver o que aconteceu | canvas em modo leitura + NDV com dados reais; "Copiar para o editor", "Debug no editor" | sucesso, erro |
| S13 | Configurações do workflow | menu "…" → Settings | timezone, workflow de erro, salvar execuções, timeout | modal com selects | — |
| S14 | Templates | `/templates` | começar de um exemplo | galeria, busca, preview do canvas, "Usar template" | vazio, carregando |
| S15 | Configurações (usuário/instância) | `/settings/*` | perfil, usuários, API key, variáveis | menu lateral, forms, tabela de usuários | — |
| S16 | Usuários e convites | `/settings/users` | convidar membros, papéis | tabela, modal de convite | pendente, ativo |
| S17 | Compartilhar workflow | botão "Compartilhar" | dar acesso a outro usuário/projeto | modal com seletor de pessoas e papel | — |
| S18 | Histórico de versões | ícone de relógio no editor | ver/restaurar versões | lista lateral + preview | — |
| S19 | Chat de teste (AI) | botão "Chat" em workflows com Chat Trigger | conversar com o agente | painel de chat + logs do agente | vazio, digitando, erro |
| S20 | Formulário público (Form Trigger) | URL pública gerada | coletar dados que disparam o fluxo | form gerado, página de sucesso | vazio, enviado, erro |
| S21 | Variáveis / Projetos | `/variables`, `/projects/:id` | organização e segredos globais | tabela | (pago no original) |

Mobile: o editor do original **não é pensado para celular**. Isso é uma
oportunidade (ver §10).

---

## 4. Fluxos de usuário

```
F01 Criar o primeiro workflow e testar (o loop principal)
    S03 vazio -> "Criar workflow" -> S04 vazio -> S05 escolher trigger "Manual"
    -> S05 escolher ação (ex. HTTP Request) -> S06 configurar URL -> "Testar passo"
    -> S06 ver output -> fechar -> S04 "Executar workflow" -> nós ficam verdes
    caminho feliz: ~9 cliques
    edge: URL inválida (nó vermelho + mensagem), output vazio (0 itens),
          fechar sem salvar (aviso "alterações não salvas")

F02 Conectar uma credencial OAuth (Google Sheets)
    S06 nó Sheets -> "Credencial: criar nova" -> S10 -> "Entrar com Google"
    -> popup OAuth -> volta "Conectado" -> S06 selecionar planilha (dropdown carregado da API)
    caminho feliz: ~6 cliques
    edge: popup bloqueado, token expira (refresh), escopo negado

F03 Receber um webhook e responder
    S05 trigger "Webhook" -> S06 copia URL de teste -> "Ouvir evento de teste"
    -> chamada externa chega -> S06 mostra o corpo -> ações seguintes usam $json
    -> ativar workflow (URL de produção passa a valer)
    edge: método errado (405), corpo não-JSON, URL de teste vs produção,
          responder imediatamente vs "responder no nó Respond to Webhook"

F04 Agendar um workflow
    S05 trigger "Schedule" -> S06 a cada X horas / cron -> toggle Ativo em S04
    edge: fuso horário (setting do workflow, S13), execução sobreposta

F05 Ramificar e transformar dados
    S04 adicionar IF / Switch -> duas saídas (true/false) -> Set (editar campos)
    -> Merge juntando ramos
    edge: item sem o campo (expressão retorna undefined), merge esperando ramo que não roda

F06 Usar expressões entre nós
    S06 arrastar campo do painel Input para um parâmetro -> vira {{ $json.campo }}
    -> S07 preview mostra o valor
    edge: referência a nó que ainda não rodou, item pareado (paired item) quebrado

F07 Depurar uma execução que falhou
    S11 filtrar "erro" -> S12 ver nó vermelho e mensagem -> "Debug no editor"
    (carrega os dados daquela execução como pinned) -> corrigir -> reexecutar
    edge: dados sensíveis na execução, execução muito grande

F08 Workflow de erro / alerta
    S13 "Workflow de erro" = outro workflow com Error Trigger -> envia Telegram
    edge: o próprio workflow de erro falha

F09 Começar de um template
    S03/S14 escolher template -> "Usar" -> S04 preenchido -> configurar credenciais faltantes
    edge: credencial de tipo inexistente, nó desconhecido

F10 Agente de IA com ferramentas
    S05 "AI Agent" -> sub-nós: modelo (Claude/OpenAI), memória, ferramentas
    -> Chat Trigger -> S19 conversar -> ver logs de chamadas de ferramenta
    edge: modelo sem chave, loop de ferramentas, limite de tokens

F11 Esperar e retomar (Wait / aprovação humana)
    nó Wait "até receber webhook" ou "por X minutos" -> execução fica "esperando" em S11
    -> retoma depois
    edge: servidor reinicia durante a espera (precisa persistir)

F12 Importar / exportar
    copiar nós (Ctrl+C) gera JSON; colar no canvas recria; importar arquivo .json
    edge: JSON de versão diferente, credenciais não vêm junto (por design)

F13 Convidar colega e compartilhar
    S16 convidar e-mail -> aceita -> S17 compartilhar workflow com papel editor/visualizador
```

Número a vencer: **F01 em ~9 cliques** e **F03 em ~6 cliques** até o primeiro
evento recebido.

---

## 5. Componentes

| componente | variantes | estados | telas |
| --- | --- | --- | --- |
| Nó do canvas | trigger (borda arredondada à esquerda), ação, sub-nó IA (circular), sticky note | normal, selecionado, executando, sucesso (contagem de itens), erro, desativado, pinned, aviso (credencial faltando) | S04, S12 |
| Conexão (aresta) | principal, IA (tracejada, tipada: model/memory/tool) | normal, hover (botões + e lixeira), com dados ("3 itens"), executando (animada) | S04 |
| Portas (handles) | entrada, saída, múltiplas saídas nomeadas (true/false, saídas do Switch) | conectável, inválida | S04 |
| Canvas | — | zoom, pan, seleção em área, minimapa(?), "zoom para caber" | S04, S12 |
| Painel lateral de busca (node creator) | triggers, ações | busca, categorias, subcategorias | S05 |
| Painel de dados (Input/Output) | tabela, JSON, schema | vazio, com dados, paginação de itens, seleção de run | S06, S12 |
| Campo de parâmetro | texto, número, boolean, select, multi-select, cor, data, JSON, coleção (add opção), fixed collection, resource locator (lista/URL/ID), credencial | fixo ↔ expressão, erro, carregando opções | S06 |
| Editor de expressão / código | inline, modal, código completo | erro, autocomplete aberto | S06, S07, S08 |
| Tabela de listas | workflows, credenciais, execuções, usuários | vazio, carregando, paginação, filtros | S03, S09, S11, S16 |
| Toggle Ativo | — | on, off, erro ao ativar | S03, S04 |
| Modal | credencial, settings, compartilhar, confirmar exclusão | — | S10, S13, S17 |
| Toast | sucesso, erro, info | — | todas |
| Sidebar principal | expandida, recolhida | item ativo | S03–S21 |
| Badge de status | sucesso, erro, rodando, esperando, cancelado | — | S11, S12 |
| Tag/chip | — | editar, remover | S03, S04 |
| Botão | primário, secundário, ghost, ícone, perigo | hover, disabled, loading | todas |
| Chat | mensagem usuário/bot, logs | digitando | S19 |

---

## 6. Modelo de dados inferido

```
User        id, email, first_name, last_name, password_hash, role (owner|admin|member),
            created_at
            evidência: S01/S02/S16, API pública /users. confiança: alta

Project     id, name, type (personal|team), created_at
            ProjectRelation(project_id, user_id, role: admin|editor|viewer)
            evidência: S21, docs de RBAC. confiança: média

Workflow    id, project_id, name, active (bool), nodes (json[]), connections (json),
            settings (json: timezone, error_workflow_id, save_executions, timeout),
            static_data (json — estado do trigger de polling), pin_data (json),
            version_id, tags[], created_at, updated_at
            evidência: S04, S13, export JSON de templates, API /workflows. confiança: alta

Node (dentro de Workflow.nodes)
            id (uuid), name (único no workflow), type ("pacote.nome"), type_version,
            position [x, y], parameters (json), credentials {tipo: {id, name}},
            disabled, notes, retry_on_fail, max_tries, continue_on_fail / on_error
            evidência: JSON de cópia/cola, S06 Settings. confiança: alta

Connections json: { "NomeOrigem": { "main": [ [ {node, type, index} ], ... ] } }
            índice externo = número da saída; tipos IA: ai_languageModel, ai_tool, ai_memory
            evidência: JSON de cópia/cola. confiança: alta
            (no clone: modelar com IDs de nó, não nomes — nomes quebram ao renomear)

WorkflowHistory  version_id, workflow_id, nodes, connections, author, created_at
            evidência: S18. confiança: média

Credential  id, project_id, name, type (ex. "googleSheetsOAuth2Api"),
            data (encrypted blob), created_at, updated_at
            evidência: S09/S10, API /credentials (nunca devolve o segredo). confiança: alta

Execution   id, workflow_id, status (new|running|success|error|waiting|canceled|crashed),
            mode (manual|trigger|webhook|retry|integrated|chat), started_at, stopped_at,
            wait_till, retry_of, data (json grande: runData por nó, itens de entrada/saída, erro)
            evidência: S11/S12, API /executions. confiança: alta

Webhook     workflow_id, node_id, method, path, is_test, webhook_id
            evidência: F03, URLs /webhook/:path e /webhook-test/:path. confiança: média

Tag         id, name; WorkflowTag(workflow_id, tag_id)   confiança: alta
Variable    id, key, value                                confiança: média
ApiKey      id, user_id, label, hashed_key, created_at    confiança: média
Template    (catálogo remoto) id, name, description, workflow_json, categories   confiança: média
```

**Unidade de dados que flui entre nós:** uma lista de *itens*, cada item
`{ json: {...}, binary?: {campo: {mimeType, fileName, data|ref}}, pairedItem }`.
Cada nó roda uma vez por item (ou uma vez para todos, conforme o nó). Isso é o
coração do motor e precisa ser decidido cedo.

---

## 7. Matriz de funcionalidades

Ver [`features.csv`](./features.csv). 72 linhas: 34 `must`, 21 `should`,
11 `could`, 6 `skip`.

---

## 8. O que não dá (ou não deve) ser clonado

| item | motivo |
| --- | --- |
| Código-fonte do n8n | Sustainable Use License; clean-room obrigatório |
| Nome, logo, ícones de nós, textos | marca e direitos do n8n |
| Catálogo de ~1000 integrações | volume, não segredo; começamos com ~15 e crescemos pelo que o público BR usa |
| Galeria de templates e comunidade | conteúdo de terceiros e rede de usuários |
| Nós da comunidade (npm) | ecossistema próprio deles |
| Apps OAuth verificados (Google, Meta, Slack…) | cada clone precisa registrar e passar pela verificação do próprio app |
| WhatsApp oficial | exige conta Meta Business + aprovação; sem atalhos não-oficiais |

---

## 9. Tamanho

| medida | quantidade |
| --- | --- |
| Telas | 21 (13 no MVP) |
| Fluxos | 13 (F01–F07 + F10 no MVP) |
| Entidades | 11 |

**Partes difíceis:**

1. **Motor de execução** — grafo dirigido com múltiplas saídas, merge que
   espera ramos, itens pareados, retry, `continueOnFail`, Wait que sobrevive a
   reinício (fila + estado persistido), sub-workflows, limites de concorrência.
2. **Canvas + NDV** — editor de nós com arrastar/conectar/zoom, painéis
   Input/Output com tabela/JSON/schema, arrastar campo → expressão, e uma
   **linguagem de expressões em sandbox** (rodar JS do usuário com segurança).
3. **Integrações com OAuth2** — armazenamento criptografado de credenciais,
   refresh de token, apps verificados no Google/Meta, carregamento dinâmico de
   opções (listar planilhas, canais etc.).

Outros: triggers de polling com `static_data`, webhooks com URL de teste vs
produção, agente de IA com ferramentas.

**Tamanho: L (um trimestre)** para o MVP útil (canvas, 3 triggers, ~10 nós core,
~5 integrações, credenciais, execuções, IA). O n8n completo é **XL → reescopar**.
Não há promessa de clone perfeito.

---

## 10. Ângulo inicial (para o `/replica-entrepreneur` confirmar)

- 100% em **PT-BR**, com integrações que o público brasileiro realmente usa:
  WhatsApp (API oficial), Telegram, Google Agenda/Sheets, Kiwify/Hotmart,
  Mercado Pago/Pix, e-mail.
- **Templates prontos por nicho** (clínica: lembrete de consulta; infoproduto:
  entrega de acesso pós-pagamento) — os dois negócios da usuária viram os
  primeiros casos de uso.
- **Editor usável no celular** (o original não é).
- Preço em reais, sem limite agressivo de execuções no plano de entrada.

---

## Próximo passo

`/replica-architect` — escolher a stack, transformar o §6 em schema SQL e
ordenar a construção numa fatia vertical fina: **trigger manual → HTTP Request
→ Set → ver execução**.
