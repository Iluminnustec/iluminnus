import { prisma } from "@/lib/prisma";
import { NovaVendaForm } from "@/components/nova-venda-form";
import { DeleteButton } from "@/components/delete-button";
import {
  calcularComissaoMensal,
  formatarMesReferencia,
  inicioDoMes,
  FAIXAS_COMISSAO,
} from "@/lib/comissionamento";
import { excluirVenda, fecharComissaoDoMes, excluirFechamento, excluirComissao } from "./actions";
import { getSessaoComEmpresa } from "@/lib/auth";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const statusStyles: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  PAGO: "bg-green-100 text-green-700",
  ATRASADO: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Paga",
  ATRASADO: "Atrasada",
};

function mesKey(data: Date) {
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function ComissoesPage() {
  const session = await getSessaoComEmpresa();
  const [clientes, vendedores, vendas, fechamentos, comissoesAntigas] = await Promise.all([
    prisma.cliente.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, vendedorId: true },
    }),
    prisma.usuario.findMany({
      where: { ativo: true, empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.venda.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { dataPagamento: "desc" },
      include: { cliente: { select: { nome: true } }, vendedor: { select: { nome: true } } },
    }),
    prisma.fechamentoComissao.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { mesReferencia: "desc" },
      include: { vendedor: { select: { nome: true } }, despesa: { include: { parcelas: true } } },
    }),
    prisma.comissao.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { dataVenda: "desc" },
      include: {
        cliente: { select: { nome: true } },
        vendedor: { select: { nome: true } },
        despesa: { include: { parcelas: true } },
      },
    }),
  ]);

  const mesesFechados = new Set(
    fechamentos.map((f) => `${f.vendedorId}__${mesKey(f.mesReferencia)}`)
  );

  // agrupa vendas ainda nao fechadas por vendedor + mes
  const gruposAbertos = new Map<
    string,
    { vendedorId: string; vendedorNome: string; mes: Date; vendas: typeof vendas }
  >();
  for (const venda of vendas) {
    const mes = inicioDoMes(venda.dataPagamento);
    const chave = `${venda.vendedorId}__${mesKey(mes)}`;
    if (mesesFechados.has(chave)) continue;
    if (!gruposAbertos.has(chave)) {
      gruposAbertos.set(chave, {
        vendedorId: venda.vendedorId,
        vendedorNome: venda.vendedor.nome,
        mes,
        vendas: [],
      });
    }
    gruposAbertos.get(chave)!.vendas.push(venda);
  }
  const gruposOrdenados = [...gruposAbertos.values()].sort(
    (a, b) => b.mes.getTime() - a.mes.getTime()
  );

  const totalPendenteFechamentos = fechamentos
    .filter((f) => f.despesa.parcelas[0]?.status !== "PAGO")
    .reduce((soma, f) => soma + f.valorComissao, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Comissões</h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">
        Comissão calculada por faixa sobre o faturamento novo efetivamente pago no
        mês, por vendedor — não incide sobre carteira recorrente de meses
        anteriores.{" "}
        {FAIXAS_COMISSAO.map((f, i) => (
          <span key={i}>
            {i > 0 && " · "}
            {f.max === Infinity
              ? `a partir de ${formatBRL(f.min)}`
              : `${formatBRL(f.min)} a ${formatBRL(f.max)}`}
            : {f.label}
          </span>
        ))}
        .
      </p>

      {totalPendenteFechamentos > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Total pendente de pagamento: <strong>{formatBRL(totalPendenteFechamentos)}</strong>
        </div>
      )}

      <div className="mt-6">
        <NovaVendaForm clientes={clientes} vendedores={vendedores} />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Meses em aberto</h2>
      <p className="mt-1 text-sm text-slate-500">
        Vendas já lançadas neste mês, ainda não fechadas. O valor da comissão é
        uma prévia — muda se novas vendas entrarem no mesmo mês.
      </p>
      <div className="mt-4 space-y-4">
        {gruposOrdenados.map((grupo) => {
          const totalVendido = grupo.vendas.reduce((soma, v) => soma + v.valorVenda, 0);
          const preview = calcularComissaoMensal(totalVendido);
          const chave = `${grupo.vendedorId}__${mesKey(grupo.mes)}`;
          return (
            <div key={chave} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {grupo.vendedorNome} — {formatarMesReferencia(grupo.mes)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatBRL(totalVendido)} vendidos · faixa {preview.label} ·{" "}
                    <span className="font-medium text-telas-navy">
                      {formatBRL(preview.valorComissao)} de comissão
                    </span>
                  </p>
                </div>
                <form action={fecharComissaoDoMes.bind(null, grupo.vendedorId, grupo.mes.toISOString())}>
                  <button
                    type="submit"
                    className="rounded-md bg-telas-navy px-4 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light"
                  >
                    Fechar comissão do mês
                  </button>
                </form>
              </div>

              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {grupo.vendas.map((venda) => (
                  <li key={venda.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="text-slate-600">
                      {formatDate(venda.dataPagamento)} — {venda.cliente.nome}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{formatBRL(venda.valorVenda)}</span>
                      <DeleteButton
                        action={excluirVenda.bind(null, venda.id)}
                        confirmMessage={`Excluir a venda de "${venda.cliente.nome}" (${formatBRL(venda.valorVenda)})?`}
                        label="Excluir"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {gruposOrdenados.length === 0 && (
          <p className="text-sm text-slate-400">Nenhuma venda em aberto no momento.</p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Fechamentos por mês</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Mês</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Total vendido</th>
              <th className="px-4 py-3">Faixa</th>
              <th className="px-4 py-3">Comissão</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fechamentos.map((f) => {
              const status = f.despesa.parcelas[0]?.status ?? "PENDENTE";
              return (
                <tr key={f.id}>
                  <td className="px-4 py-3 text-slate-600">{formatarMesReferencia(f.mesReferencia)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{f.vendedor.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{formatBRL(f.totalVendido)}</td>
                  <td className="px-4 py-3 text-slate-600">{f.percentual}%</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{formatBRL(f.valorComissao)}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/painel/despesas/${f.despesaId}`}
                      className={`rounded-full px-2 py-1 text-xs font-medium hover:underline ${statusStyles[status]}`}
                    >
                      {statusLabels[status]}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={excluirFechamento.bind(null, f.id)}
                      confirmMessage={`Reabrir o mês de ${f.vendedor.nome} em ${formatarMesReferencia(f.mesReferencia)}? A despesa gerada será excluída e as vendas voltam pra "meses em aberto".`}
                      label="Reabrir"
                    />
                  </td>
                </tr>
              );
            })}
            {fechamentos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Nenhum mês fechado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {comissoesAntigas.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-700">
            Histórico do modelo antigo (comissão única por venda, antes da faixa mensal)
          </summary>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor da venda</th>
                  <th className="px-4 py-3">%</th>
                  <th className="px-4 py-3">Comissão</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comissoesAntigas.map((c) => {
                  const status = c.despesa.parcelas[0]?.status ?? "PENDENTE";
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3 text-slate-600">{formatDate(c.dataVenda)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{c.vendedor.nome}</td>
                      <td className="px-4 py-3 text-slate-600">{c.cliente.nome}</td>
                      <td className="px-4 py-3 text-slate-600">{formatBRL(c.valorVenda)}</td>
                      <td className="px-4 py-3 text-slate-600">{c.percentual}%</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{formatBRL(c.valorComissao)}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/painel/despesas/${c.despesaId}`}
                          className={`rounded-full px-2 py-1 text-xs font-medium hover:underline ${statusStyles[status]}`}
                        >
                          {statusLabels[status]}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteButton
                          action={excluirComissao.bind(null, c.id)}
                          confirmMessage={`Excluir a comissão antiga de ${c.vendedor.nome} pela venda de "${c.cliente.nome}"?`}
                          label="Excluir"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
