import { prisma } from "@/lib/prisma";
import { DespesaForm } from "../despesa-form";
import { createDespesa } from "../actions";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function NovaDespesaPage() {
  const session = await getSessaoComEmpresa();
  const usuarios = await prisma.usuario.findMany({
    where: { ativo: true, empresaId: session.empresaId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Nova despesa</h1>
      <DespesaForm action={createDespesa} usuarios={usuarios} submitLabel="Criar despesa" />
    </div>
  );
}
