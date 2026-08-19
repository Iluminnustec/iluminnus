import { getClienteSession } from "@/lib/auth-cliente";
import { prisma } from "@/lib/prisma";

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

export default async function PropostasClientePage() {
  const session = await getClienteSession();
  const propostas = await prisma.proposta.findMany({
    where: { clienteId: session!.clienteId, empresaId: session!.empresaId },
    orderBy: { createdAt: "desc" },
    include: { itens: { include: { tela: { include: { predio: true } } } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Minhas propostas</h1>
      <p className="mt-1 text-sm text-slate-500">
        Assim que enviada, nosso time analisa e entra em contato pra fechar o contrato.
      </p>

      <div className="mt-6 space-y-4">
        {propostas.map((proposta) => (
          <div key={proposta.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {proposta.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
              </p>
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
            <p className="mt-3 text-right font-semibold text-slate-900">
              Total: R$ {proposta.valorTotal.toFixed(2).replace(".", ",")}/mês
            </p>
          </div>
        ))}
        {propostas.length === 0 && (
          <p className="text-sm text-slate-400">Você ainda não enviou nenhuma proposta.</p>
        )}
      </div>
    </div>
  );
}
