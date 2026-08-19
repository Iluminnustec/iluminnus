import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/delete-button";
import { DispositivoRowForm } from "@/components/dispositivo-row-form";
import { updateDispositivo, deleteDispositivo } from "./actions";
import { getSessaoComEmpresa } from "@/lib/auth";

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function estaOnline(ultimoContato: Date) {
  return Date.now() - ultimoContato.getTime() < 5 * 60 * 1000;
}

export default async function DispositivosPage() {
  const session = await getSessaoComEmpresa();
  const [dispositivos, telas] = await Promise.all([
    prisma.dispositivo.findMany({
      where: { OR: [{ empresaId: session.empresaId }, { empresaId: null }] },
      orderBy: { ultimoContato: "desc" },
      include: { tela: { include: { predio: true } } },
    }),
    prisma.tela.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      include: { predio: { select: { nome: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dispositivos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Caixinhas que já se conectaram ao sistema. Atribua cada uma a uma Tela para
        que ela comece a exibir a playlist correspondente — pode trocar a qualquer
        momento, remotamente, sem precisar tocar no aparelho.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dispositivo</th>
              <th className="px-4 py-3">Tela atribuída</th>
              <th className="px-4 py-3">Último contato</th>
              <th className="px-4 py-3">Versão do app</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dispositivos.map((dispositivo) => {
              const online = estaOnline(dispositivo.ultimoContato);
              const acao = updateDispositivo.bind(null, dispositivo.id);
              const acaoExcluir = deleteDispositivo.bind(null, dispositivo.id);
              return (
                <tr key={dispositivo.id}>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        online ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-500" : "bg-slate-400"}`}
                      />
                      {online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-slate-400">{dispositivo.deviceId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <DispositivoRowForm
                      acao={acao}
                      apelido={dispositivo.apelido ?? ""}
                      telaId={dispositivo.telaId ?? ""}
                      telaNomeAtual={
                        dispositivo.tela
                          ? `${dispositivo.tela.predio.nome} — ${dispositivo.tela.nome}`
                          : null
                      }
                      telas={telas.map((t) => ({
                        id: t.id,
                        nome: t.nome,
                        predioNome: t.predio.nome,
                      }))}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDateTime(dispositivo.ultimoContato)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{dispositivo.appVersao ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={acaoExcluir}
                      confirmMessage={`Excluir o dispositivo "${dispositivo.apelido ?? dispositivo.deviceId}"?`}
                      label="Excluir"
                    />
                  </td>
                </tr>
              );
            })}
            {dispositivos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Nenhum dispositivo se conectou ainda. Instale o app numa caixinha
                  e ele aparece aqui automaticamente no primeiro contato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
