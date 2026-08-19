import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";
import { PrediosMapLoader } from "@/components/predios-map-loader";

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

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function AdminEmpresasPage() {
  const [empresas, prediosComTelas] = await Promise.all([
    prisma.empresa.findMany({
      orderBy: { nome: "asc" },
      include: { assinatura: true, _count: { select: { usuarios: true } } },
    }),
    prisma.predio.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      select: {
        id: true,
        nome: true,
        bairro: true,
        latitude: true,
        longitude: true,
        empresa: { select: { nome: true } },
        _count: { select: { telas: true } },
      },
    }),
  ]);
  const agora = new Date();

  const pinsDoMapa = prediosComTelas.map((p) => ({
    id: p.id,
    nome: `${p.nome} · ${p.empresa.nome}`,
    bairro: p.bairro,
    latitude: p.latitude as number,
    longitude: p.longitude as number,
    totalTelas: p._count.telas,
  }));

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

      <div className="mt-6 max-h-[560px] overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
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
                    {empresa.assinatura?.trialAte && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          empresa.assinatura.trialAte < agora
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {empresa.assinatura.trialAte < agora
                          ? `Trial expirado em ${formatDate(empresa.assinatura.trialAte)}`
                          : `Trial até ${formatDate(empresa.assinatura.trialAte)}`}
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

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Mapa de todos os prédios (todas as empresas)
      </h2>
      <div className="mt-3 h-80 max-w-3xl overflow-hidden rounded-lg border border-slate-200">
        {pinsDoMapa.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-400">
            Nenhum prédio com coordenadas cadastradas em nenhuma empresa ainda.
          </div>
        ) : (
          <PrediosMapLoader predios={pinsDoMapa} />
        )}
      </div>
    </div>
  );
}
