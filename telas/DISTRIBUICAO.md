# Multi-tenant: como o Telas atende vários donos

Este documento existia antes para explicar como "duplicar o projeto inteiro"
por empresa. **Isso mudou.** O sistema agora é multi-tenant de verdade: um
único deploy, um único banco Postgres, isolado por linha (`empresaId`) em
vez de por cópia de código. A Brivox Mídia é o primeiro dono cadastrado
nesse modelo novo, não mais "o sistema em si".

Quem gerencia os donos (cadastra empresa nova, controla assinatura mensal,
bloqueia/libera acesso) é a **Iluminnus**, dona do produto Telas — pela área
`/admin`, com login próprio (cargo `SUPER_ADMIN`, sem vínculo com nenhuma
empresa).

---

## Visão geral do sistema

Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, Prisma 7 com
`@prisma/adapter-pg` sobre Supabase Postgres, autenticação por JWT (`jose`)
em cookies httpOnly, hospedado na Vercel. Existe também um app Android
separado (`brivox-player`, Kotlin + media3/ExoPlayer) que roda nas telas
físicas.

Três áreas de autenticação, cada uma com seu próprio cookie de sessão:

- **`/admin/*`** — staff da Iluminnus (dona do produto). `src/lib/auth.ts`,
  cookie `brivox_session`, cargo `SUPER_ADMIN` (`Usuario.empresaId = null`).
  Cadastra `Empresa` (dono), `Assinatura` (plano/valor/vencimento/status) e
  o primeiro `Usuario` (`ADMIN`) de cada dono novo. Registra pagamentos
  manualmente (`PagamentoAssinatura`) — sem gateway integrado por enquanto.
- **`/painel/*`** — equipe de um dono. Mesmo `src/lib/auth.ts`/cookie, RBAC
  por `Cargo` (`ADMIN`, `SUPERVISOR`, `VENDAS`, `SOCIO`) em
  `src/lib/rbac.ts`. `Usuario.empresaId` sempre preenchido aqui.
- **`/cliente/*`** — os clientes/anunciantes de um dono se cadastram e logam
  sozinhos. `src/lib/auth-cliente.ts`, cookie `brivox_cliente_session`. Sem
  RBAC — sempre "o próprio cliente vendo os próprios dados", escopado pelo
  `empresaId` da empresa resolvida no cadastro (ver seção de domínio).

`src/proxy.ts` (Next 16 renomeou `middleware.ts`) guarda `/painel/:path*` e
`/admin/:path*`: confere JWT válido e se o `cargo` da sessão pode acessar
aquele prefixo de rota (`podeAcessar` em `rbac.ts`). `SUPER_ADMIN` só acessa
`/admin`; os demais cargos só acessam `/painel`.

### Isolamento por empresa

Todo model de negócio (`Predio`, `Tela`, `Midia`, `Cliente`, `Despesa`,
`Cobranca`, `ItemEstoque`, `Venda`, `Comissao`, `FechamentoComissao`,
`Proposta`, `Playlist`) tem `empresaId` obrigatório, e toda query em
`src/app/painel/**`/`src/app/api/**` filtra por
`session.empresaId` (helper `getSessaoComEmpresa()` em `src/lib/auth.ts`).
`Usuario.empresaId` e `LogAtividade.empresaId` são opcionais — `null`
significa staff/ação da própria Iluminnus. `Dispositivo.empresaId` também é
opcional: um dispositivo físico recém pareado (checkin em
`/api/dispositivos/checkin`) fica sem dono até alguém vincular a uma Tela em
`/painel/dispositivos` — lacuna conhecida de UX de provisionamento, sem
urgência enquanto só a Brivox tem telas físicas.

**Bloqueio de acesso por inadimplência**: `src/lib/assinatura.ts`
(`empresaBloqueada`) — `Empresa.ativo = false` (kill-switch manual) ou
`Assinatura.status` em `SUSPENSA`/`CANCELADA` bloqueia login em `/painel` e
`/cliente` (redireciona pra `/painel-bloqueado` / `/cliente-bloqueado`).
`ATRASADA` ainda dá acesso — é o prazo de tolerância antes de alguém da
Iluminnus decidir suspender de fato em `/admin`.

### Resolução de domínio (site público + cadastro de cliente)

`src/lib/empresa.ts` (`getEmpresaAtual()`) resolve a `Empresa` pelo header
`Host` da requisição (`Empresa.dominio`), com fallback pra primeira empresa
ativa se não achar (dev local, ou domínio ainda não configurado na Vercel).
Hoje só é usado no cadastro/login de `/cliente` (`src/app/cliente/actions.ts`)
— é o ponto onde é *funcionalmente* necessário saber de qual dono é a
visita antes de criar o registro.

**Gap conhecido, deliberado por ora:** o site público institucional
(`src/app/(site)/*` — home, planos, sobre, contato) **não** usa essa
resolução — continua com conteúdo fixo da Brivox (textos, preços, "João
Pessoa", cores `brivox-*`, WhatsApp em `src/lib/brand.ts`). Fazer esse site
ser multi-tenant de verdade (headline, preços, cores, contato por dono)
exigiria um mini-CMS por empresa — decisão de produto maior, fora do escopo
da virada pra multi-tenant. **Enquanto isso não existir, o segundo dono
cadastrado em `/admin` não deve apontar o domínio dele pro site público
sem antes recriar/adaptar manualmente essas páginas** — mesmo princípio de
"amarra que se troca na mão" que já existia, só que agora só se aplica ao
site, não ao sistema inteiro.

---

## O que é "amarra" da Brivox no site público (ainda precisa trocar na mão por dono)

| O quê | Onde |
|---|---|
| Nome, WhatsApp | `src/lib/brand.ts` |
| Cores da marca | `brivox-navy` / `brivox-blue` / `brivox-bronze` em `src/app/globals.css` |
| Logos | `public/brand/*.png` |
| Textos e preços do site público | `src/app/(site)/page.tsx`, `sobre`, `contato`, `planos` |
| Faixas de comissão | `src/lib/comissionamento.ts` — `FAIXAS_COMISSAO` (pode variar por dono; hoje é global no código, não por `Empresa`) |
| Precificação por escassez | `src/lib/precificacao.ts` — `CAPACIDADE_MAXIMA_TELA`, `FAIXAS_OCUPACAO` (idem — global, não por `Empresa`) |
| App Android | `applicationId`/`namespace` em `app/build.gradle.kts`, ícone, nome, URL do backend em `Config.kt` — só se o dono novo também tem telas físicas |

As duas primeiras linhas da tabela (comissão e precificação) são regras de
negócio hoje *globais no código*, compartilhadas por todos os donos — não
uma coluna em `Empresa`. Se um segundo dono precisar de faixas diferentes
da Brivox, isso ainda vira trabalho de código, não um campo no `/admin`.

---

## Como cadastrar um dono novo (fluxo atual)

1. Logar em `/admin` com uma conta `SUPER_ADMIN` (ver `prisma/seed.ts`).
2. `/admin/empresas/novo` — preenche nome, domínio (se já tiver), cidade,
   plano/valor/vencimento da assinatura e os dados do primeiro usuário
   `ADMIN` do dono. Isso já cria `Empresa` + `Assinatura` + `Usuario` numa
   transação — o dono já consegue logar em `/painel` na hora.
3. Configurar o domínio do dono novo apontando pro projeto Vercel existente
   (domínio próprio por dono, ver `Empresa.dominio`) — passo manual, fora do
   que dá pra automatizar por código.
4. **Se** o dono novo também usa telas físicas: revisar o gap de
   provisionamento de `Dispositivo` acima, e duplicar/configurar o app
   Android (`applicationId`, ícone, `Config.kt`) se ele não puder usar o
   mesmo pacote instalado da Brivox.
5. Cobrança segue manual: registrar cada pagamento em
   `/admin/empresas/[id]` (aba de assinatura) conforme for recebendo.

Não existe mais passo de "duplicar repositório" ou "criar banco novo" para
um dono novo — isso só se aplicaria se um dia a Iluminnus decidir que um
produto *diferente* (não o Telas) precisa de outra base de código.

---

## Variáveis de ambiente (`.env`)

- `DATABASE_URL` — conexão pooled (transaction mode) do Supabase Postgres, usada em runtime pela aplicação.
- `DIRECT_URL` — conexão direta (session mode), usada pelo Prisma Migrate (`prisma.config.ts`).
- `SESSION_SECRET` — chave usada pra assinar os JWTs de sessão (staff, cliente e super-admin, todas com o mesmo segredo desta instalação).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — usadas no browser pra upload direto de mídia pro Supabase Storage (contorna o limite de ~4,5MB do Vercel).
- `SUPABASE_URL` / `SUPABASE_SECRET_KEY` — usadas no servidor (`src/lib/storage.ts`) pra gerar as signed upload URLs.
- `NEXT_PUBLIC_SITE_URL` — usada em `sitemap.ts`/`robots.ts` pra montar URLs absolutas.

Nenhum `.env` real existe ainda em nenhuma das cópias locais — a instalação
com Supabase/Vercel de verdade é o próximo passo fora do código, quando o
usuário tiver o projeto Supabase criado.

---

## Achado durante essa preparação: backup estava quebrado

Ao revisar `backup-db.ps1` pra documentar o fluxo de release, encontrei que
desde a migração de SQLite pra Postgres (por volta da v1.4.0) o script
vinha copiando um arquivo `dev.db` **congelado e sem uso** — a aplicação já
rodava 100% em Postgres, então toda mensagem "Backup created" de lá pra cá
(dezenas de releases) não estava salvando dados reais. Corrigido agora:
`backup-db.ps1` chama `backup-postgres.ts`, que exporta todas as tabelas
do banco real via Prisma pra um JSON em `db-backups/postgres-vX.Y.Z-*.json`
— testado e confirmado funcionando (174 registros no teste, antes da virada
multi-tenant). O `dev.db` antigo foi deixado no lugar (não é usado por nada
mais) só por precaução, mas pode ser apagado com segurança quando quiser.
