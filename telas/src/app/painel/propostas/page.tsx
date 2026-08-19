import { prisma } from "@/lib/prisma";
import { aprovarProposta, recusarProposta } from "./actions";
import { getSessaoComEmpresa } from "@/lib/auth";

const statusLabels: Record<string, string> = {
  PENDENTE: "Em análise",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
};

const statusStyles: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  APROVADA: "bg-green-100 text-green-700",
  RECUSADA: "bg-red-100 text-red-700",
};

export default async function PropostasPage() {
  const session = await getSessaoComEmpresa();
  const propostas = await prisma.proposta.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { createdAt: "desc" },
    include: {
      cliente: true,
      itens: { include: { tela: { include: { predio: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Propostas</h1>
      <p className="mt-1 text-sm text-slate-500">
        Planos personalizados que clientes montaram sozinhos no site, escolhendo
        telas específicas. Aprovar aqui não fecha o contrato automaticamente —
        use como lista de leads pra retornar e formalizar a venda.
      </p>

      <div className="mt-6 space-y-4">
        {propostas.map((proposta) => (
          <div key={proposta.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{proposta.cliente.nome}</p>
                <p className="text-xs text-slate-500">
                  {proposta.cliente.email} · {proposta.cliente.telefone ?? "sem telefone"} ·{" "}
                  {proposta.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[proposta.status]}`}
              >
                {statusLabels[proposta.status]}
              </span>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {proposta.itens.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span>
                    {item.tela.predio.nome} — {item.tela.nome}
                  </span>
                  <span className="shrink-0">R$ {item.precoNoMomento.toFixed(2).replace(".", ",")}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between">
              <p className="font-semibold text-slate-900">
                Total: R$ {proposta.valorTotal.toFixed(2).replace(".", ",")}/mês
              </p>
              {proposta.status === "PENDENTE" && (
                <div className="flex gap-2">
                  <form action={recusarProposta.bind(null, proposta.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Recusar
                    </button>
                  </form>
                  <form action={aprovarProposta.bind(null, proposta.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-telas-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-telas-navy-light"
                    >
                      Aprovar
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
        {propostas.length === 0 && (
          <p className="text-sm text-slate-400">Nenhuma proposta recebida ainda.</p>
        )}
      </div>
    </div>
  );
}
