import { prisma } from "@/lib/prisma";
import { TelaForm } from "../tela-form";
import { createTela } from "../actions";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function NovaTelaPage({
  searchParams,
}: {
  searchParams: Promise<{ predioId?: string }>;
}) {
  const { predioId } = await searchParams;
  const session = await getSessaoComEmpresa();
  const predios = await prisma.predio.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Nova tela</h1>
      <TelaForm
        action={createTela}
        predios={predios}
        defaultValues={predioId ? { predioId } : undefined}
        submitLabel="Criar tela"
      />
    </div>
  );
}
