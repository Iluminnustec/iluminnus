import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateIndicadorAtivo, marcarComissaoPaga } from "../../actions";

export default async function IndicadorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const indicador = await prisma.indicador.findUnique({
    where: { id },
    include: {
      empresas: { orderBy: { nome: "asc" }, select: { id: true, nome: true, ativo: true } },
      comissoes: {
        orderBy: { createdAt: "desc" },
        include: {
          empresa: { select: { nome: true } },
          pagamentoAssinatura: { select: { referencia: true } },
        },
      },
    },
  });
  if (!indicador) notFound();

  const pendente = indicador.comissoes
    .filter((c) => c.status === "PENDENTE")
    .reduce((soma, c) => soma + c.valorComissao, 0);
  const paga = indicador.comissoes
    .filter((c) => c.status === "PAGA")
    .reduce((soma, c) => soma + c.valorComissao, 0);

  const toggleAtivo = updateIndicadorAtivo.bind(null, indicador.id, !indicador.ativo);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{indicador.nome}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {indicador.contato ?? "sem contato"} · {indicador.percentualPadrao}% por pagamento
            {indicador.chavePix && ` · Pix: ${indicador.chavePix}`}
          </p>
        </div>
        <form action={toggleAtivo}>
          <button
            type="submit"
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              indicador.ativo
                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {indicador.ativo ? "Desativar indicador" : "Reativar indicador"}
          </button>
        </form>
      </div>

      {!indicador.ativo && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Indicador desativado — novos pagamentos das empresas indicadas por ele não geram mais
          comissão.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase text-slate-500">Empresas indicadas</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{indicador.empresas.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase text-slate-500">Comissão pendente</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">R$ {pendente.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase text-slate-500">Comissão já paga</p>
          <p className="mt-1 text-2xl font-bold text-green-700">R$ {paga.toFixed(2)}</p>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Empresas indicadas</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {indicador.empresas.map((empresa) => (
            <Link
              key={empresa.id}
              href={`/admin/empresas/${empresa.id}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                empresa.ativo
                  ? "border-slate-200 text-slate-700 hover:border-iluminnus-gold"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {empresa.nome}
            </Link>
          ))}
          {indicador.empresas.length === 0 && (
            <p className="text-sm text-slate-400">Nenhuma empresa indicada por ele ainda.</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Comissões</h2>
        <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Referência</th>
                <th className="px-4 py-3">Valor pago</th>
                <th className="px-4 py-3">Comissão</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {indicador.comissoes.map((comissao) => {
                const marcarPaga = marcarComissaoPaga.bind(null, comissao.id, indicador.id);
                return (
                  <tr key={comissao.id}>
                    <td className="px-4 py-3 text-slate-900">{comissao.empresa.nome}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {comissao.pagamentoAssinatura.referencia.toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">R$ {comissao.valorPago.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      R$ {comissao.valorComissao.toFixed(2)} ({comissao.percentual}%)
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          comissao.status === "PAGA"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {comissao.status === "PAGA" ? "Paga" : "Pendente"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {comissao.status === "PENDENTE" && (
                        <form action={marcarPaga}>
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Marcar como paga
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
              {indicador.comissoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Nenhuma comissão gerada ainda -- vai aparecer aqui quando alguma empresa
                    indicada por ele tiver um pagamento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
