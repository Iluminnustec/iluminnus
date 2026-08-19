# Site institucional da Iluminnus

Landing page da **Iluminnus Technology** (empresa dona do produto Telas e de
futuros produtos). Site estático — sem backend, sem banco de dados, sem
autenticação. Só apresenta a empresa e lista os produtos (hoje só o Telas).

## Stack

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4. Sem
Prisma, sem Supabase, sem nenhuma dependência de dado dinâmico.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Não precisa de `.env` — não tem nenhuma
variável de ambiente.

## Estrutura

```
src/app/
  layout.tsx     — fontes, metadata, badge de versão
  page.tsx        — a única página (hero, sobre, produtos, contato)
  globals.css     — paleta de cores (navy/dourado/azul, extraída do brasão)
src/components/
  hero.tsx, sobre.tsx, produtos.tsx, contato.tsx, site-header.tsx, site-footer.tsx
public/brand/     — logos (Vertical/horizontal), copiados de Logo/ na pasta raiz da Iluminnus
```

Pra adicionar um produto novo além do Telas: editar o array `PRODUTOS` em
`src/components/produtos.tsx`.

## Identidade visual

Paleta em `src/app/globals.css` (`--color-*`): navy quase preto de fundo,
dourado como cor primária, azul elétrico como accent — extraída direto do
brasão em `Logo/Vertical.jpeg` (pasta raiz da Iluminnus, fora deste repo).

## Deploy

Vercel, root directory `site` dentro do monorepo
(`github.com/Iluminnustec/iluminnus`). Redeploya sozinho a cada `git push`
na `main`. Sem variáveis de ambiente pra configurar.
