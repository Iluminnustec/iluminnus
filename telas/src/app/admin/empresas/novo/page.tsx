import { prisma } from "@/lib/prisma";
import { EmpresaForm } from "./empresa-form";

export default async function NovaEmpresaPage() {
  const indicadores = await prisma.indicador.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Nova empresa</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cadastra o dono, a assinatura mensal e o primeiro usuário administrador dele.
      </p>

      <EmpresaForm indicadores={indicadores} />
    </div>
  );
}
