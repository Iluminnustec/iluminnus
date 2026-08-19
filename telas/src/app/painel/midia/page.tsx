import { prisma } from "@/lib/prisma";
import { MidiaUploadForm } from "@/components/midia-upload-form";
import { DeleteButton } from "@/components/delete-button";
import { TelaCheckboxList } from "@/components/tela-checkbox-list";
import { updateMidia, deleteMidia, moverMidia } from "./actions";
import { getSessaoComEmpresa } from "@/lib/auth";

function formatDuracao(tipo: string, segundos: number) {
  return tipo === "VIDEO" ? "até o fim do vídeo" : `${segundos}s`;
}

export default async function MidiaPage() {
  const session = await getSessaoComEmpresa();
  const [itens, clientes, telas] = await Promise.all([
    prisma.midia.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { ordem: "asc" },
      include: {
        cliente: { select: { nome: true } },
        telas: { select: { id: true, nome: true, predio: { select: { nome: true } } } },
      },
    }),
    prisma.cliente.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.tela.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      include: { predio: { select: { nome: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mídia da playlist</h1>
      <p className="mt-1 text-sm text-slate-500">
        Conteúdo que aparece nas telas em rede. Escolha em quais telas cada mídia deve
        aparecer — sem marcar nenhuma, ela vira institucional e toca em todas.
      </p>

      <div className="mt-6">
        <MidiaUploadForm clientes={clientes} telas={telas} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Prévia</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Telas</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Ativa</th>
              <th className="px-4 py-3">Ordem</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {itens.map((midia) => (
              <tr key={midia.id}>
                <td className="px-4 py-3">
                  {midia.tipo === "IMAGEM" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={midia.url}
                      alt={midia.nome}
                      className="h-14 w-24 rounded object-cover"
                    />
                  ) : (
                    <video src={midia.url} className="h-14 w-24 rounded object-cover" muted />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{midia.nome}</td>
                <td className="px-4 py-3">
                  <select
                    name="clienteId"
                    form={`midia-form-${midia.id}`}
                    defaultValue={midia.clienteId ?? ""}
                    className="w-36 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                  >
                    <option value="">Nenhum (institucional)</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <form
                    id={`midia-form-${midia.id}`}
                    action={async (formData: FormData) => {
                      "use server";
                      await updateMidia(midia.id, formData);
                    }}
                    className="flex flex-col gap-2"
                  >
                    <div className="w-56">
                      <TelaCheckboxList
                        telas={telas}
                        defaultSelectedIds={midia.telas.map((t) => t.id)}
                        compact
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {midia.telas.length === 0
                        ? "Nenhuma marcada = institucional (todas)"
                        : `${midia.telas.length} tela(s) marcada(s)`}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="duracaoSegundos"
                        min={1}
                        defaultValue={midia.duracaoSegundos}
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                        title={formatDuracao(midia.tipo, midia.duracaoSegundos)}
                      />
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          name="ativo"
                          defaultChecked={midia.ativo}
                          className="h-4 w-4"
                        />
                        ativa
                      </label>
                      <button
                        type="submit"
                        className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDuracao(midia.tipo, midia.duracaoSegundos)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      midia.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {midia.ativo ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <form
                      action={async () => {
                        "use server";
                        await moverMidia(midia.id, "up");
                      }}
                    >
                      <button className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50">
                        ↑
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await moverMidia(midia.id, "down");
                      }}
                    >
                      <button className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50">
                        ↓
                      </button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton
                    action={deleteMidia.bind(null, midia.id)}
                    confirmMessage={`Excluir "${midia.nome}" da playlist? Essa ação não pode ser desfeita.`}
                    label="Excluir"
                  />
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma mídia na playlist ainda. Envie a primeira acima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        API pública que a caixa/app consulta (não precisa de login):{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-slate-700">
          /api/telas/&#123;id-da-tela&#125;/playlist
        </code>{" "}
        — cada tela recebe as mídias marcadas especificamente pra ela, mais as
        institucionais (sem nenhuma tela marcada).
      </div>
    </div>
  );
}
