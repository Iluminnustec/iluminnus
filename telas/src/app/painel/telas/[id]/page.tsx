import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TelaForm } from "../tela-form";
import { updateTela } from "../actions";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function EditarTelaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessaoComEmpresa();
  const [tela, predios] = await Promise.all([
    prisma.tela.findUnique({ where: { id, empresaId: session.empresaId } }),
    prisma.predio.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  if (!tela) notFound();

  const action = updateTela.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Editar tela</h1>
      <TelaForm
        action={action}
        predios={predios}
        defaultValues={tela}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
