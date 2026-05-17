## Diagnóstico atual

O que já funciona:
- Dashboard lê dados reais do Google Ads (MCC `7717152917`) para todas as 23 contas
- Meta Ads funciona para 5 contas (Ótica Areias, Supripostos, Pérola Pratas, Connect Petro, Fast Charger)
- Chat-agent (`supabase/functions/chat-agent/index.ts`) já tem estrutura de tool-calling com 2 ações (pause_adset, update_budget)

O que está quebrado ou incompleto:
- 9 contas Meta retornam erro "ads_read permission" — token global insuficiente
- Chat usa `OPENAI_API_KEY` (custo extra) e referencia `metaBmToken` por cliente que nunca foi implementado
- Edge `meta-ads` não tem o modo `update_adset` que o chat tenta chamar — qualquer ação pelo chat dá erro
- `clientsConfig.ts` é estático em código — não dá pra adicionar/remover cliente sem deploy
- Não há criação de campanhas, controle de criativos, nem auditoria do que o agente faz
- Mensagens do chat não renderizam markdown

---

## Fase 1 — Persistir clientes no banco (substituir clientsConfig.ts)

**Por quê:** Hoje qualquer mudança em cliente exige edit em código. Para escalar (chat criando cliente, BM token por cliente, etc.) precisa estar em DB.

**O que fazer:**
1. Criar tabelas `clients`, `client_platform_accounts` (uma linha por par cliente+plataforma com `account_id` e `auth_token` opcional)
2. Seed inicial com os 23 clientes atuais
3. Criar hook `useClients()` que lê do banco
4. Substituir imports de `clientsConfig` em `Index.tsx` e `ChatPanel.tsx`
5. Tela simples de CRUD de clientes (lista + form para adicionar/editar)

**Resultado:** Você adiciona/remove cliente pela UI sem precisar de deploy.

---

## Fase 2 — Resolver permissões Meta (BM token por cliente)

**Por quê:** Um único `META_ACCESS_TOKEN` global só vê as contas onde o usuário do token tem acesso direto. As 9 contas que falham são de BMs diferentes que não autorizaram esse token.

**Duas opções (escolher uma):**

**Opção A — System User token por BM (recomendado para agência):**
- Cada BM dos clientes gera um System User com permissão `ads_management`
- Você salva o token na tabela `client_platform_accounts.auth_token`
- Edge `meta-ads` usa o token específico do cliente em vez do global

**Opção B — App Meta certificado:**
- Submete seu app no Meta para revisão (advanced_access em `ads_read` e `ads_management`)
- Cliente autoriza via OAuth (botão "Conectar Meta" no dashboard)
- Token é armazenado por cliente

**Recomendação:** Opção A para começar (mais rápida, sem revisão de app). Migra para B quando crescer.

**O que fazer:**
1. Coluna `auth_token` em `client_platform_accounts` (já criada na Fase 1)
2. Refatorar `meta-ads` para aceitar `bm_token` opcional no body e usar quando presente (fallback no `META_ACCESS_TOKEN` global)
3. UI no CRUD de cliente: campo "BM Access Token" mascarado

---

## Fase 3 — Trocar OpenAI por Lovable AI (zero custo extra)

**Por quê:** OpenAI exige API key paga. Lovable AI Gateway dá acesso a gpt-5, gemini-2.5, etc. sem key adicional (usa `LOVABLE_API_KEY` já configurada).

**O que fazer:**
1. Reescrever `chat-agent/index.ts` para chamar `https://ai.gateway.lovable.dev/v1/chat/completions` com `Bearer ${LOVABLE_API_KEY}`
2. Modelo recomendado: `google/gemini-2.5-flash` (rápido + bom em tool-calling)
3. Manter formato de tools (compatível com OpenAI)

---

## Fase 4 — Expandir as skills do agente

**Skills mínimas para "agência completa":**

| Skill | Plataforma | Tipo |
|---|---|---|
| `get_account_summary` | Meta + Google | Leitura |
| `get_campaigns_list` | Meta + Google | Leitura |
| `get_creatives_performance` | Meta | Leitura |
| `pause_campaign` / `activate_campaign` | Meta + Google | Ação |
| `pause_adset` / `activate_adset` | Meta + Google | Ação |
| `update_budget` (campaign ou adset) | Meta + Google | Ação |
| `create_campaign_draft` | Meta + Google | Ação (cria em PAUSED) |
| `duplicate_adset` | Meta | Ação |

**O que fazer:**
1. Em `meta-ads/index.ts` e `google-ads/index.ts`: adicionar modes para cada ação (POST/PATCH nas APIs nativas das plataformas)
2. Em `chat-agent`: declarar cada skill na lista `tools` com schema JSON do input
3. Handler genérico que despacha tool-call → invoke da edge function correta
4. **Regra importante**: toda criação de campanha começa em status PAUSED — usuário ativa manualmente

---

## Fase 5 — Confirmação + Auditoria

**Por quê:** Agente pode estragar campanhas reais. Precisa de freio.

**O que fazer:**
1. Tabela `agent_actions` (cliente, usuário, skill, input_json, result_json, status, created_at)
2. Toda ação destrutiva (pause/update/create) registra em `agent_actions` antes e depois
3. UI: bolha do chat para ações mostra botão "Confirmar" antes de executar (estado pending → executed)
4. Página `/historico` listando todas ações do agente com filtro por cliente/data

---

## Fase 6 — Polimento do chat

1. Renderizar markdown nas mensagens (`react-markdown` + `prose` do tailwind-typography)
2. Persistir conversas em DB (tabela `chat_messages` por cliente)
3. Streaming de resposta (SSE) para feedback em tempo real
4. Sugestões rápidas ("Como está o CPA hoje?", "Pause campanhas com ROAS < 1", etc.)

---

## Ordem de execução recomendada

```text
Semana 1: Fase 1 (DB de clientes) → Fase 2 (BM tokens)
Semana 2: Fase 3 (Lovable AI) → Fase 4 parte leitura (skills)
Semana 3: Fase 4 parte escrita + Fase 5 (auditoria)
Semana 4: Fase 6 (polimento)
```

---

## Detalhes técnicos por fase

**Fase 1 — Schema:**
```text
clients (id, name, created_at)
client_platform_accounts (id, client_id, platform [google|meta],
                          account_id, auth_token, created_at)
```
RLS: autenticação obrigatória; só usuários com role `admin` editam.

**Fase 4 — Como o agente chama uma skill:**
```text
Usuário: "Pause a campanha 'Black Friday'"
↓
Gemini retorna tool_call { name: "pause_campaign",
                            args: { campaign_id: "123..." } }
↓
chat-agent faz supabase.functions.invoke('meta-ads', {
  body: { mode: 'pause_campaign', campaign_id, bm_token }
})
↓
Registra em agent_actions, devolve resposta para o chat
```

**Fase 5 — Padrão de auditoria:**
Toda ação destrutiva grava ANTES de executar (status=`pending`),
executa, depois UPDATE com `status=success` ou `failed` + `result_json`.

---

## O que eu preciso de você para começar

Para a Fase 1 (DB de clientes), só preciso da sua confirmação que posso seguir.
Para a Fase 2 (BM token), você precisará gerar 1 System User token na BM de cada cliente que está dando erro e me passar (vou pedir via secret form quando chegar nessa fase, não precisa preparar agora).

Quer que eu comece pela Fase 1 agora?