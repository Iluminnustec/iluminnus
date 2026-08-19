import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function main() {
  const [
    usuarios,
    logAtividades,
    clientes,
    propostas,
    propostaItens,
    comissoes,
    predios,
    telas,
    dispositivos,
    playlists,
    midias,
    cobrancas,
    despesas,
    vendas,
    fechamentosComissao,
    despesaParcelas,
    itensEstoque,
    movimentosEstoque,
  ] = await Promise.all([
    prisma.usuario.findMany(),
    prisma.logAtividade.findMany(),
    prisma.cliente.findMany(),
    prisma.proposta.findMany(),
    prisma.propostaItem.findMany(),
    prisma.comissao.findMany(),
    prisma.predio.findMany(),
    prisma.tela.findMany(),
    prisma.dispositivo.findMany(),
    prisma.playlist.findMany(),
    prisma.midia.findMany({ include: { telas: { select: { id: true } } } }),
    prisma.cobranca.findMany(),
    prisma.despesa.findMany(),
    prisma.venda.findMany(),
    prisma.fechamentoComissao.findMany(),
    prisma.despesaParcela.findMany(),
    prisma.itemEstoque.findMany(),
    prisma.movimentoEstoque.findMany(),
  ]);

  const dump = {
    geradoEm: new Date().toISOString(),
    usuarios,
    logAtividades,
    clientes,
    propostas,
    propostaItens,
    comissoes,
    predios,
    telas,
    dispositivos,
    playlists,
    midias,
    cobrancas,
    despesas,
    vendas,
    fechamentosComissao,
    despesaParcelas,
    itensEstoque,
    movimentosEstoque,
  };

  const outPath = process.argv[2];
  if (!outPath) {
    console.error("Uso: tsx backup-postgres.ts <caminho-do-arquivo-de-saida>");
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(dump, null, 2), "utf-8");

  const totalRegistros = Object.entries(dump)
    .filter(([chave]) => chave !== "geradoEm")
    .reduce((soma, [, valor]) => soma + (Array.isArray(valor) ? valor.length : 0), 0);
  console.log(`Backup salvo em ${outPath} (${totalRegistros} registros no total).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
