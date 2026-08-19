import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/delete-button";
import { PeriodFilter } from "@/components/period-filter";
import { calcularIntervalo } from "@/lib/period";
import { ReceitaDespesaPie, AssinaturasStatusBar } from "@/components/dashboard-charts";
import {
  criarDespesaIluminnus,
  marcarDespesaIluminnusPaga,
  excluirDespesaIluminnus,
} from "./actions";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string }>;
}) {
  const params = await searchParams;
  const { inicio, fim, label: periodoLabel } = calcularIntervalo(
    params.periodo,
    params.inicio,
    params.fim
  );

  const [
    assinaturasPorStatus,
    pagamentosDoPeriodo,
    despesasDoPeriodo,
    pagamentosRecentes,
    despesas,
  ] = await Promise.all([
    prisma.assinatura.groupBy({ by: ["status"], _count: { _all: true }, _sum: { valorMensal: true } }),
    prisma.pagamentoAssinatura.aggregate({
      where: { dataPagamento: { gte: inicio, lt: fim } },
      _sum: { valor: true },
    }),
    prisma.despesaIluminnus.aggregate({
      where: { data: { gte: inicio, lt: fim } },
      _sum: { valor: true },
    }),
    prisma.pagamentoAssinatura.findMany({
      where: { dataPagamento: { gte: inicio, lt: fim } },
      orderBy: { dataPagamento: "desc" },
      include: { assinatura: { include: { empresa: { select: { nome: true } } } } },
    }),
    prisma.despesaIluminnus.findMany({
      where: { data: { gte: inicio, lt: fim } },
      orderBy: { data: "desc" },
    }),
  ]);

  const contarStatus = (status: string) =>
    assinaturasPorStatus.find((a) => a.status === status)?._count._all ?? 0;
  const mrr = assinaturasPorStatus
    .filter((a) => a.status === "ATIVA")
    .reduce((soma, a) => soma + (a._sum.valorMensal ?? 0), 0);

  const receitaPeriodo = pagamentosDoPeriodo._sum.valor ?? 0;
  const despesaPeriodo = despesasDoPeriodo._sum.valor ?? 0;
  const saldoPeriodo = receitaPeriodo - despesaPeriodo;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fluxo de caixa da Iluminnus — receita das assinaturas dos donos e despesas próprias.
          </p>
        </div>
        <PeriodFilter />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Visão geral
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">MRR (assinaturas ativas)</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatBRL(mrr)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Recebido no período</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatBRL(receitaPeriodo)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Despesas no período</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatBRL(despesaPeriodo)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Saldo do período</p>
          <p
            className={`mt-2 text-2xl font-bold ${saldoPeriodo < 0 ? "text-red-600" : "text-slate-900"}`}
          >
            {formatBRL(saldoPeriodo)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Gráficos
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <ReceitaDespesaPie
          receita={receitaPeriodo}
          despesa={despesaPeriodo}
          periodoLabel={periodoLabel}
        />
        <AssinaturasStatusBar
          ativas={contarStatus("ATIVA")}
          atrasadas={contarStatus("ATRASADA")}
          suspensas={contarStatus("SUSPENSA")}
          canceladas={contarStatus("CANCELADA")}
        />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Pagamentos no período
      </h2>
      <div className="mt-3 max-h-96 overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Referência</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagamentosRecentes.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {p.assinatura.empresa.nome}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatBRL(p.valor)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(p.dataPagamento)}</td>
              </tr>
            ))}
            {pagamentosRecentes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  Nenhum pagamento no período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Despesas da Iluminnus
      </h2>
      <form action={criarDespesaIluminnus} className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <input
          name="descricao"
          placeholder="Descrição"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none"
        />
        <input
          name="categoria"
          placeholder="Categoria"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none"
        />
        <input
          name="valor"
          type="number"
          step="0.01"
          min="0"
          placeholder="Valor"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none"
        />
        <input
          name="data"
          type="date"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-iluminnus-navy px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Adicionar
        </button>
      </form>

      <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {despesas.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{d.descricao}</td>
                <td className="px-4 py-3 text-slate-600">{d.categoria ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{formatBRL(d.valor)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(d.data)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      d.status === "PAGO"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {d.status === "PAGO" ? "Pago" : "Pendente"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {d.status !== "PAGO" && (
                      <form action={marcarDespesaIluminnusPaga.bind(null, d.id)}>
                        <button className="text-xs font-medium text-slate-500 hover:text-green-700">
                          Marcar paga
                        </button>
                      </form>
                    )}
                    <DeleteButton
                      action={excluirDespesaIluminnus.bind(null, d.id)}
                      confirmMessage={`Excluir a despesa "${d.descricao}"?`}
                      label="Excluir"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {despesas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma despesa no período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
