import { prisma } from "@/lib/prisma";
import { CobrancaForm } from "../cobranca-form";
import { createCobranca } from "../actions";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function NovaCobrancaPage() {
  const session = await getSessaoComEmpresa();
  const clientes = await prisma.cliente.findMany({
    where: { ativo: true, empresaId: session.empresaId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Nova cobrança</h1>
      <CobrancaForm action={createCobranca} clientes={clientes} submitLabel="Criar cobrança" />
    </div>
  );
}
