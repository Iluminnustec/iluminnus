import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function PrediosPage() {
  const session = await getSessaoComEmpresa();
  const predios = await prisma.predio.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { nome: "asc" },
    include: { _count: { select: { telas: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prédios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Empreendimentos mapeados onde a Brivox instala telas.
          </p>
        </div>
        <Link
          href="/painel/predios/novo"
          className="rounded-md bg-brivox-navy px-4 py-2 text-sm font-medium text-white hover:bg-brivox-navy-light"
        >
          Novo prédio
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Bairro</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Telas instaladas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {predios.map((predio) => (
              <tr key={predio.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/predios/${predio.id}`}
                    className="group font-medium text-slate-900 hover:text-brivox-navy-light"
                  >
                    {predio.nome}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-brivox-navy-light" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{predio.bairro || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{predio.cidade}</td>
                <td className="px-4 py-3 text-slate-600">{predio._count.telas}</td>
              </tr>
            ))}
            {predios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  Nenhum prédio cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
