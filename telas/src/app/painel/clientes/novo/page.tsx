import { prisma } from "@/lib/prisma";
import { ClienteForm } from "../cliente-form";
import { createCliente } from "../actions";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function NovoClientePage() {
  const session = await getSessaoComEmpresa();
  const vendedores = await prisma.usuario.findMany({
    where: { ativo: true, empresaId: session.empresaId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Novo cliente</h1>
      <ClienteForm
        action={createCliente}
        vendedores={vendedores}
        vendedorTravado={session.cargo === "VENDAS"}
        submitLabel="Criar cliente"
      />
    </div>
  );
}
