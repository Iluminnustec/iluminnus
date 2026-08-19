import { prisma } from "@/lib/prisma";
import { getSessaoComEmpresa } from "@/lib/auth";
import { AdicionarEstoqueForm } from "../adicionar-estoque-form";

export default async function NovoItemEstoquePage() {
  const session = await getSessaoComEmpresa();
  const itens = await prisma.itemEstoque.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, quantidade: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Adicionar ao estoque</h1>
      <AdicionarEstoqueForm itens={itens} />
    </div>
  );
}
