import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IndicadorForm } from "./indicador-form";

export default async function IndicadoresPage() {
  const indicadores = await prisma.indicador.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { empresas: true } },
      comissoes: { select: { valorComissao: true, status: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Indicadores</h1>
        <p className="mt-1 text-sm text-slate-500">
          Programa de indicação: quem traz um dono novo pro Telas recebe comissão recorrente
          sobre cada pagamento de assinatura dele, enquanto continuar ativo.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Novo indicador</h2>
        <div className="mt-4">
          <IndicadorForm />
        </div>
      </section>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">Contato</th>
              <th className="px-5 py-3">%</th>
              <th className="px-5 py-3">Empresas indicadas</th>
              <th className="px-5 py-3">Comissão pendente</th>
              <th className="px-5 py-3">Comissão paga</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {indicadores.map((indicador) => {
              const pendente = indicador.comissoes
                .filter((c) => c.status === "PENDENTE")
                .reduce((soma, c) => soma + c.valorComissao, 0);
              const paga = indicador.comissoes
                .filter((c) => c.status === "PAGA")
                .reduce((soma, c) => soma + c.valorComissao, 0);
              return (
                <tr key={indicador.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/indicadores/${indicador.id}`}
                      className="font-medium text-slate-900 hover:text-iluminnus-gold"
                    >
                      {indicador.nome}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{indicador.contato ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{indicador.percentualPadrao}%</td>
                  <td className="px-5 py-3 text-slate-600">{indicador._count.empresas}</td>
                  <td className="px-5 py-3 text-amber-700">
                    R$ {pendente.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-green-700">R$ {paga.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        indicador.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {indicador.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {indicadores.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                  Nenhum indicador cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
