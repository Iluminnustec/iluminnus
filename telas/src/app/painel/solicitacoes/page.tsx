import { prisma } from "@/lib/prisma";
import { getSessaoComEmpresa } from "@/lib/auth";
import { aprovarSolicitacao, recusarSolicitacao } from "../clientes/actions";

const CAMPO_LABELS: Record<string, string> = {
  nome: "Nome",
  razaoSocial: "Razão social",
  cnpjCpf: "CNPJ/CPF",
  email: "E-mail",
  telefone: "Telefone",
  endereco: "Endereço",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  cep: "CEP",
  planoTelas: "Pacote (qtd. de telas)",
  observacoes: "Observações",
};

const statusStyles: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  APROVADA: "bg-green-100 text-green-700",
  RECUSADA: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
};

function formatDate(date: Date) {
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function SolicitacoesPage() {
  const session = await getSessaoComEmpresa();
  const solicitacoes = await prisma.solicitacaoAlteracaoCliente.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { createdAt: "desc" },
    include: {
      cliente: { select: { nome: true } },
      solicitante: { select: { nome: true } },
      revisadoPor: { select: { nome: true } },
    },
    take: 100,
  });

  const pendentes = solicitacoes.filter((s) => s.status === "PENDENTE");
  const resolvidas = solicitacoes.filter((s) => s.status !== "PENDENTE");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Solicitações de alteração</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vendedores propõem mudanças no cadastro do cliente aqui — cabe a você aprovar (aplica de
        fato) ou recusar.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Pendentes {pendentes.length > 0 && `(${pendentes.length})`}
      </h2>
      <div className="mt-4 space-y-4">
        {pendentes.map((s) => (
          <div key={s.id} className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{s.cliente.nome}</p>
              <p className="text-xs text-slate-500">
                {s.solicitante.nome} · {formatDate(s.createdAt)}
              </p>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {Object.entries(s.camposNovos as Record<string, unknown>).map(([campo, valor]) => (
                <li key={campo}>
                  <span className="font-medium">{CAMPO_LABELS[campo] ?? campo}:</span>{" "}
                  {String(valor || "—")}
                </li>
              ))}
            </ul>
            {s.motivo && <p className="mt-2 text-sm italic text-slate-600">"{s.motivo}"</p>}
            <div className="mt-4 flex gap-2">
              <form action={recusarSolicitacao.bind(null, s.id)}>
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Recusar
                </button>
              </form>
              <form action={aprovarSolicitacao.bind(null, s.id)}>
                <button
                  type="submit"
                  className="rounded-md bg-telas-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-telas-navy-light"
                >
                  Aprovar
                </button>
              </form>
            </div>
          </div>
        ))}
        {pendentes.length === 0 && (
          <p className="text-sm text-slate-400">Nenhuma solicitação pendente.</p>
        )}
      </div>

      {resolvidas.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-700">
            Histórico ({resolvidas.length})
          </summary>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Solicitante</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Revisado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resolvidas.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.cliente.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{s.solicitante.nome}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[s.status]}`}>
                        {statusLabels[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.revisadoPor?.nome ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
