import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";
import { calcularPrecoTela, contarOcupacaoPorTela } from "@/lib/precificacao";
import { getSessaoComEmpresa } from "@/lib/auth";

const statusStyles: Record<string, string> = {
  ATIVA: "bg-green-100 text-green-700",
  INATIVA: "bg-slate-100 text-slate-500",
  MANUTENCAO: "bg-amber-100 text-amber-700",
};

const statusLabels: Record<string, string> = {
  ATIVA: "Ativa",
  INATIVA: "Inativa",
  MANUTENCAO: "Manutenção",
};

const tipoLabels: Record<string, string> = {
  TV_ELEVADOR: "TV no elevador",
  TOTEM_HALL: "Totem no hall",
  TELA_HORIZONTAL: "Tela horizontal",
  OUTRO: "Outro",
};

function estaOnline(ultimoContato?: Date) {
  if (!ultimoContato) return false;
  return Date.now() - ultimoContato.getTime() < 5 * 60 * 1000;
}

export default async function TelasPage() {
  const session = await getSessaoComEmpresa();
  const [telas, midiasAtivas] = await Promise.all([
    prisma.tela.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      include: {
        predio: true,
        dispositivos: { orderBy: { ultimoContato: "desc" }, take: 1 },
      },
    }),
    prisma.midia.findMany({
      where: { ativo: true, clienteId: { not: null }, empresaId: session.empresaId },
      select: { clienteId: true, telas: { select: { id: true } } },
    }),
  ]);

  const ocupacaoPorTela = contarOcupacaoPorTela(midiasAtivas);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Telas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pontos de mídia indoor instalados nos prédios da rede Telas.
          </p>
        </div>
        <Link
          href="/painel/telas/novo"
          className="rounded-md bg-telas-navy px-4 py-2 text-sm font-medium text-white hover:bg-telas-navy-light"
        >
          Nova tela
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Conexão</th>
              <th className="px-4 py-3">Tela</th>
              <th className="px-4 py-3">Prédio</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ocupação</th>
              <th className="px-4 py-3">Preço atual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {telas.map((tela) => {
              const dispositivo = tela.dispositivos[0];
              const online = estaOnline(dispositivo?.ultimoContato);
              const ocupacao = ocupacaoPorTela.get(tela.id) ?? 0;
              const preco = calcularPrecoTela(tela.precoBase, ocupacao);
              return (
              <tr key={tela.id}>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                      !dispositivo
                        ? "bg-slate-100 text-slate-400"
                        : online
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                    title={
                      dispositivo
                        ? `Último contato: ${dispositivo.ultimoContato.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
                        : "Nenhum dispositivo vinculado a esta tela"
                    }
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        !dispositivo ? "bg-slate-400" : online ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {!dispositivo ? "Sem caixinha" : online ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/telas/${tela.id}`}
                    className="group font-medium text-slate-900 hover:text-telas-navy-light"
                  >
                    {tela.nome}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-telas-navy-light" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <Link href={`/painel/predios/${tela.predio.id}`} className="hover:text-telas-navy-light">
                    {tela.predio.nome}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{tipoLabels[tela.tipo]}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[tela.status]}`}
                  >
                    {statusLabels[tela.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${preco.badge}`}
                    title={`${ocupacao} de ${preco.capacidade} vagas ocupadas`}
                  >
                    {preco.label} · {ocupacao}/{preco.capacidade}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  R$ {preco.precoAtual.toFixed(2).replace(".", ",")}
                  {preco.multiplicador > 1 && (
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      ({preco.multiplicador}x base)
                    </span>
                  )}
                </td>
              </tr>
              );
            })}
            {telas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma tela cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
