import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClienteForm } from "../cliente-form";
import { updateCliente } from "../actions";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessaoComEmpresa();
  const [cliente, vendedores] = await Promise.all([
    prisma.cliente.findUnique({ where: { id, empresaId: session.empresaId } }),
    prisma.usuario.findMany({
      where: { ativo: true, empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);
  if (!cliente) notFound();

  const action = updateCliente.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Editar cliente</h1>
      <ClienteForm
        action={action}
        vendedores={vendedores}
        defaultValues={cliente}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
