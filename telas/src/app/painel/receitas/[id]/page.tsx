import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CobrancaForm } from "../cobranca-form";
import { updateCobranca, deleteCobranca } from "../actions";
import { DeleteButton } from "@/components/delete-button";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function EditarCobrancaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessaoComEmpresa();
  const [cobranca, clientes] = await Promise.all([
    prisma.cobranca.findUnique({ where: { id, empresaId: session.empresaId } }),
    prisma.cliente.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  if (!cobranca) notFound();

  const action = updateCobranca.bind(null, id);
  const deleteAction = deleteCobranca.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Editar cobrança</h1>
        <DeleteButton
          action={deleteAction}
          confirmMessage={`Excluir a cobrança "${cobranca.descricao}"? Essa ação não pode ser desfeita.`}
          label="Excluir cobrança"
        />
      </div>
      <CobrancaForm
        action={action}
        clientes={clientes}
        defaultValues={cobranca}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
