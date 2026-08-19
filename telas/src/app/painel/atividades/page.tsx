import { prisma } from "@/lib/prisma";
import { getSessaoComEmpresa } from "@/lib/auth";

const LIMITE_VISUAL = 50;

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function AtividadesPage() {
  const session = await getSessaoComEmpresa();
  const [logs, total] = await Promise.all([
    prisma.logAtividade.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { createdAt: "desc" },
      take: LIMITE_VISUAL,
    }),
    prisma.logAtividade.count({ where: { empresaId: session.empresaId } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Atividades</h1>
      <p className="mt-1 text-sm text-slate-500">
        Histórico de quem fez o quê no painel — mostrando os {Math.min(LIMITE_VISUAL, total)} mais
        recentes de {total} no total. Nenhum registro é apagado, só a listagem aqui é limitada
        para a página não ficar pesada.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Quem</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{log.usuarioNome}</p>
                  <p className="text-xs text-slate-400">{log.usuarioEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {log.acao}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{log.descricao}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma atividade registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
