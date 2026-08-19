# Telas

Sistema de gestão de mídia indoor (telas físicas em prédios/estabelecimentos)
— multi-tenant, desenvolvido e operado pela **Iluminnus Technology**. Este
README é o ponto de partida pra qualquer dev novo entender o projeto sem
precisar perguntar nada — se algo aqui estiver desatualizado ou faltando,
atualize ao mexer no código.

Leia também **[`DISTRIBUICAO.md`](./DISTRIBUICAO.md)** — histórico das
decisões de arquitetura (por que é multi-tenant, o que já foi "amarra" da
Brivox e ainda precisa virar genérico, como cadastrar um dono novo).

---

## Visão geral em 30 segundos

- **Um produto, vários donos.** A Iluminnus vende o Telas por assinatura
  mensal pra empresas ("donos") que administram redes de telas físicas. Um
  único deploy, um único banco, isolado por linha (`empresaId`) — não é
  "uma cópia do código por cliente".
- **Quatro áreas de acesso, quatro públicos diferentes:**

  | Área | Quem acessa | Cookie de sessão | O que faz |
  |---|---|---|---|
  | `/admin` | Staff da Iluminnus (`Cargo.SUPER_ADMIN`) | `brivox_session` | Cadastra donos, controla assinatura/cobrança, vê o fluxo de caixa da própria Iluminnus |
  | `/painel` | Staff de um dono (`ADMIN`/`SUPERVISOR`/`VENDAS`/`SOCIO`) | `brivox_session` | Gerencia prédios, telas, mídia, clientes, financeiro daquele dono |
  | `/cliente` | Anunciantes de um dono | `brivox_cliente_session` | Cliente do dono monta plano, acompanha propostas |
  | `/assinar` | Público (sem login) | — | Autoatendimento: quem quer virar dono novo se cadastra sozinho, 14 dias grátis |
  | `(site)` | Público (sem login) | — | Site institucional do **dono** (marca dele, não da Iluminnus) |

- **App Android separado** (`../sistema-base-player`, fora deste
  repositório no monorepo) roda nas telas físicas e consome
  `/api/telas/[id]/playlist` e `/api/dispositivos/checkin` (endpoints
  públicos, sem autenticação — protegidos só pelo `deviceId`).

---

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **Prisma 7** com `@prisma/adapter-pg` sobre **Supabase Postgres**
- Autenticação por **JWT** (`jose`) em cookies `httpOnly` — sem NextAuth, sem Supabase Auth (mão própria, ver `src/lib/auth.ts`)
- **Supabase Storage** só pra upload de mídia (imagens/vídeos das telas) — não pra dados nem auth
- Hospedagem: **Vercel**

---

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencher com as credenciais reais (pedir pro time)
npx prisma generate
npx prisma migrate deploy   # aplica as migrations existentes no banco
npx prisma db seed          # cria o super-admin da Iluminnus + um dono de exemplo
npm run dev
```

Abre `http://localhost:3000/login`. Credenciais do seed: ver
`prisma/seed.ts` — os e-mails estão lá, as **senhas reais em produção não
estão no código** (foram trocadas direto no banco depois do seed inicial;
pergunte pro time ou reset a sua senha localmente).

### Variáveis de ambiente

Ver `.env.example` pra lista completa com comentário de cada uma. Resumo:

- `DATABASE_URL` / `DIRECT_URL` — conexão com o Supabase Postgres. Hoje
  ambas apontam pro **session pooler** (porta 5432) — o *transaction*
  pooler (porta 6543, `pgbouncer=true`) recusou conexão nesta rede/projeto
  quando testado, não investigado a fundo. Vale revisitar se performance em
  produção precisar de mais conexões concorrentes.
- `SESSION_SECRET` — assina os JWTs de sessão (staff, cliente, super-admin
  — todos usam o mesmo segredo desta instalação, únicos por deploy).
- `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_*` — só pra upload de mídia
  (Supabase Storage), não tem relação com autenticação nem com o Postgres.
- `NEXT_PUBLIC_SITE_URL` — usado em `sitemap.ts`/`robots.ts`.

**Nunca commitar `.env`** — já está no `.gitignore`. As credenciais reais
de produção (Supabase, Vercel) ficam só no `.env` local de cada dev e nas
Environment Variables do projeto na Vercel — nunca no código.

---

## Modelo de dados multi-tenant

Todo model de negócio (`Predio`, `Tela`, `Midia`, `Cliente`, `Despesa`,
`Cobranca`, `ItemEstoque`, `Venda`, `Comissao`, `FechamentoComissao`,
`Proposta`, `Playlist`) tem `empresaId` **obrigatório**, apontando pra
`Empresa` (o dono). Toda query em `src/app/painel/**` e
`src/app/api/**` filtra por esse `empresaId` — helper
`getSessaoComEmpresa()` em `src/lib/auth.ts` resolve a sessão já com
`empresaId` garantido não-nulo.

Exceções (campo opcional, `null` tem significado especial):

- `Usuario.empresaId` — `null` = staff da própria Iluminnus (cargo
  `SUPER_ADMIN`, não pertence a nenhum dono).
- `LogAtividade.empresaId` — `null` = ação de nível plataforma.
- `Dispositivo.empresaId` — `null` = dispositivo físico recém pareado,
  ainda sem vínculo a nenhuma Tela (fica "solto" até alguém da equipe
  vincular manualmente em `/painel/dispositivos`).

### Empresa, Assinatura, licença

- `Empresa` — o dono. Tem `licenca` (código único gerado automaticamente,
  formato `TELAS-XXXX-XXXX-XXXX`) e `ativo` (kill-switch manual).
- `Assinatura` — 1:1 com Empresa. `status` (`ATIVA`/`ATRASADA`/
  `SUSPENSA`/`CANCELADA`) controla o acesso: `SUSPENSA`/`CANCELADA` ou
  `Empresa.ativo = false` bloqueia login em `/painel` e `/cliente`
  (`src/lib/assinatura.ts`, checado nos respectivos `layout.tsx`).
  `trialAte` marca período de teste grátis (preenchido pelo auto-cadastro
  em `/assinar`) — enquanto no futuro, dá acesso mesmo sem pagamento
  registrado.
- `PagamentoAssinatura` — histórico de pagamentos, registrado manualmente
  pelo super-admin em `/admin/empresas/[id]` (**sem gateway de pagamento
  integrado** — decisão deliberada por ora). Registrar um pagamento marca
  `status: "ATIVA"` de novo e empurra `proximoVencimento`.
- `src/lib/provisionamento.ts` — `provisionarEmpresa()` cria
  Empresa+Assinatura+primeiro Usuario numa transação só; usado tanto por
  `/admin/empresas/novo` (super-admin cadastra manualmente) quanto por
  `/assinar` (autoatendimento, cria com trial e já loga automaticamente).

### Financeiro da Iluminnus vs. financeiro de cada dono

São dois livros-caixa **completamente separados**, não confundir:

- `/painel/despesas` + `/painel/receitas` — caixa de **cada dono**
  (`Despesa`/`Cobranca`, com `empresaId`).
- `/admin/financeiro` — caixa da **própria Iluminnus**: receita agregada
  de `PagamentoAssinatura` de todos os donos + `DespesaIluminnus` (model
  separado, sem `empresaId`, são despesas da Iluminnus mesma — infra,
  ferramentas, etc). MRR é a soma de `Assinatura.valorMensal` de quem está
  `ATIVA`.

---

## RBAC e autenticação

- `src/lib/rbac.ts` — `Cargo` (`SUPER_ADMIN | ADMIN | SUPERVISOR | VENDAS |
  SOCIO`) e `ROTAS_POR_CARGO` (allow-list de prefixo de rota por cargo).
  `SUPER_ADMIN` só acessa `/admin`; os demais só acessam `/painel`.
- `src/proxy.ts` (Next 16 renomeou `middleware.ts`) — guarda
  `/painel/:path*` e `/admin/:path*`, valida o JWT e chama `podeAcessar()`.
- `src/lib/auth.ts` / `src/lib/auth-cliente.ts` — sessões JWT em cookie
  httpOnly, independentes uma da outra (staff vs. cliente).
- `src/lib/empresa.ts` (`getEmpresaAtual()`) — resolve a `Empresa` pelo
  header `Host` da requisição. Usado hoje só no cadastro/login de
  `/cliente`, que é onde é *funcionalmente* necessário saber de qual dono é
  a visita antes de criar o registro. **O site público `(site)/*` não usa
  isso** — continua com conteúdo fixo (ver `DISTRIBUICAO.md`, seção de
  gap conhecido).

---

## Estrutura de pastas (o que fica onde)

```
src/app/
  admin/          — painel da Iluminnus (super-admin)
  painel/         — painel de cada dono
  cliente/        — área do cliente/anunciante de um dono
  assinar/        — autoatendimento público (novo dono se cadastra)
  (site)/         — site institucional público do dono (marca dele)
  api/            — endpoints públicos pros dispositivos físicos
  login/          — login único (staff + super-admin, mesma tabela Usuario)
  painel-bloqueado/, cliente-bloqueado/ — telas de assinatura suspensa
src/lib/
  auth.ts, auth-cliente.ts   — sessões JWT
  rbac.ts                    — cargos e permissão por rota
  prisma.ts                  — client singleton
  provisionamento.ts         — criar Empresa+Assinatura+Usuario
  assinatura.ts              — regra de bloqueio por inadimplência
  empresa.ts                 — resolver Empresa pelo domínio
  log.ts                     — registrar LogAtividade
  comissionamento.ts, precificacao.ts — regras de negócio específicas do
    ramo de mídia indoor (não genéricas — ver DISTRIBUICAO.md)
prisma/
  schema.prisma, seed.ts, migrations/
```

---

## Deploy

Vercel, root directory `telas` dentro do monorepo
(`github.com/Iluminnustec/iluminnus`). Redeploya sozinho a cada
`git push` na `main`. Variáveis de ambiente configuradas em **Project →
Settings → Environment Variables** na Vercel (mesmos valores do `.env`
local, marcadas pra Production/Preview/Development).

Banco: projeto Supabase real, compartilhado entre dev local e produção
(não existe banco de staging separado hoje — cuidado ao rodar migration ou
mexer em dado direto).
