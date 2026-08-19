# Iluminnus

Monorepo da **Iluminnus Technology** — empresa que desenvolve e opera
software próprio, vendido por assinatura mensal. Este repositório reúne o
site institucional e o primeiro produto, o Telas.

## Projetos

| Pasta | O que é | README |
|---|---|---|
| `site/` | Site institucional da Iluminnus (landing page, sem backend) | [`site/README.md`](./site/README.md) |
| `telas/` | Produto Telas: gestão de mídia indoor, multi-tenant, Next.js + Prisma + Supabase | [`telas/README.md`](./telas/README.md) — comece por aqui pra entender a arquitetura |

Cada pasta é um **projeto Vercel independente** (mesmo repositório, Root
Directory diferente por projeto — `site` e `telas`). Um `git push` na
`main` redesploya os dois automaticamente, cada um só reconstrói se algo
mudou na sua própria pasta.

## Antes de mexer em código

1. Leia o README do projeto que for tocar (`site/README.md` ou
   `telas/README.md` — este último tem a arquitetura completa: multi-tenant,
   RBAC, modelo de dados, variáveis de ambiente).
2. O `telas/` precisa de um `.env` local (Supabase real) pra rodar — não
   tem banco de dev separado do de produção hoje. Pede as credenciais pro
   time, nunca commita o `.env`.
3. Depois de mexer: `npx tsc --noEmit` e `npm run build` em cada projeto
   antes de dar push — não tem CI configurado ainda, é manual.

## Infraestrutura

- **GitHub**: `github.com/Iluminnustec/iluminnus` (este repositório).
- **Vercel**: hospedagem dos dois projetos, deploy automático a cada push.
- **Supabase**: banco Postgres do Telas (o site não usa banco nenhum).

Nenhum domínio próprio configurado ainda — os dois projetos rodam nos
endereços gratuitos `*.vercel.app` da Vercel até decidir comprar um
domínio.
