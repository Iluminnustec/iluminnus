import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";

const STATUS_LABEL: Record<string, string> = {
  ATIVA: "Ativa",
  ATRASADA: "Atrasada",
  SUSPENSA: "Suspensa",
  CANCELADA: "Cancelada",
};

const STATUS_CLASSES: Record<string, string> = {
  ATIVA: "bg-green-100 text-green-700",
  ATRASADA: "bg-amber-100 text-amber-700",
  SUSPENSA: "bg-red-100 text-red-700",
  CANCELADA: "bg-slate-100 text-slate-500",
};

export default async function AdminEmpresasPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { nome: "asc" },
    include: { assinatura: true, _count: { select: { usuarios: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Donos cadastrados no Telas e o status da assinatura de cada um.
          </p>
        </div>
        <Link
          href="/admin/empresas/novo"
          className="rounded-md bg-iluminnus-navy px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Nova empresa
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Domínio</th>
              <th className="px-4 py-3">Usuários</th>
              <th className="px-4 py-3">Assinatura</th>
              <th className="px-4 py-3">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empresas.map((empresa) => (
              <tr key={empresa.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/empresas/${empresa.id}`}
                    className="group font-medium text-slate-900 hover:text-iluminnus-gold"
                  >
                    {empresa.nome}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-iluminnus-gold" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{empresa.dominio ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{empresa._count.usuarios}</td>
                <td className="px-4 py-3 text-slate-600">
                  {empresa.assinatura
                    ? `${empresa.assinatura.plano} · R$ ${empresa.assinatura.valorMensal.toFixed(2)}/mês`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {empresa.assinatura && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASSES[empresa.assinatura.status]}`}
                      >
                        {STATUS_LABEL[empresa.assinatura.status]}
                      </span>
                    )}
                    {!empresa.ativo && (
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-white">
                        Bloqueada
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {empresas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Nenhuma empresa cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
