import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";
import { marcarReembolsado } from "./actions";
import { getSessaoComEmpresa } from "@/lib/auth";

const categoriaLabels: Record<string, string> = {
  EQUIPAMENTO: "Equipamento",
  ESTOQUE: "Estoque",
  INSTALACAO: "Instalação",
  MANUTENCAO: "Manutenção",
  MARKETING: "Marketing",
  ADMINISTRATIVO: "Administrativo",
  COMISSAO: "Comissão",
  OUTROS: "Outros",
};

const formaPagamentoLabels: Record<string, string> = {
  A_VISTA: "À vista",
  CARTAO_CREDITO: "Cartão de crédito",
  PIX: "PIX",
  BOLETO: "Boleto",
  TRANSFERENCIA: "Transferência",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function DespesasPage() {
  const session = await getSessaoComEmpresa();
  const despesas = await prisma.despesa.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { dataCompra: "desc" },
    include: { parcelas: true, pagoPorSocio: { select: { nome: true } } },
  });

  const pendentesReembolso = despesas.filter((d) => d.pagoPorSocioId && !d.reembolsado);
  const totalPorSocio = new Map<string, { nome: string; total: number }>();
  for (const d of pendentesReembolso) {
    const nome = d.pagoPorSocio!.nome;
    const atual = totalPorSocio.get(nome) ?? { nome, total: 0 };
    atual.total += d.valorTotal;
    totalPorSocio.set(nome, atual);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Despesas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Compras e gastos da empresa (equipamentos, estoque, operação).
          </p>
        </div>
        <Link
          href="/painel/despesas/novo"
          className="rounded-md bg-telas-navy px-4 py-2 text-sm font-medium text-white hover:bg-telas-navy-light"
        >
          Nova despesa
        </Link>
      </div>

      {pendentesReembolso.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-800">
            Reembolsos pendentes a sócios
          </h2>
          <p className="mt-1 text-xs text-amber-700">
            Dinheiro que alguém adiantou do próprio bolso porque ainda não entrou caixa
            da empresa. Devolver assim que o fluxo permitir.
          </p>
          <div className="mt-3 space-y-2">
            {Array.from(totalPorSocio.values()).map((item) => (
              <div key={item.nome} className="flex items-center justify-between text-sm">
                <span className="text-amber-900">{item.nome}</span>
                <span className="font-semibold text-amber-900">{formatBRL(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 divide-y divide-amber-200/60 border-t border-amber-200 pt-2">
            {pendentesReembolso.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-1.5 text-xs">
                <Link href={`/painel/despesas/${d.id}`} className="text-amber-800 hover:underline">
                  {d.descricao} — {d.pagoPorSocio!.nome} ({formatBRL(d.valorTotal)})
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await marcarReembolsado(d.id);
                  }}
                >
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded border border-amber-400 px-2 py-0.5 font-medium text-amber-700 hover:bg-amber-100"
                  >
                    Marcar reembolsado
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Valor total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {despesas.map((despesa) => (
              <tr key={despesa.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/despesas/${despesa.id}`}
                    className="group font-medium text-slate-900 hover:text-telas-navy-light"
                  >
                    {despesa.descricao}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-telas-navy-light" />
                  </Link>
                  {despesa.pagoPorSocio && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        despesa.reembolsado
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {despesa.reembolsado
                        ? `Reembolsado (${despesa.pagoPorSocio.nome})`
                        : `Adiantado por ${despesa.pagoPorSocio.nome}`}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {categoriaLabels[despesa.categoria]}
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(despesa.dataCompra)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formaPagamentoLabels[despesa.formaPagamento]}
                  {despesa.numeroParcelas > 1 && ` · ${despesa.numeroParcelas}x`}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatBRL(despesa.valorTotal)}
                </td>
              </tr>
            ))}
            {despesas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma despesa cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
