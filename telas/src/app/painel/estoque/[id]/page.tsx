import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemForm } from "../item-form";
import { updateItemEstoque } from "../actions";
import { InstalarForm } from "../instalar-form";
import { MovimentoForm } from "../movimento-form";
import { getSessaoComEmpresa } from "@/lib/auth";

const tipoStyles: Record<string, string> = {
  ENTRADA: "bg-green-100 text-green-700",
  SAIDA: "bg-red-100 text-red-700",
};

const tipoLabels: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function EditarItemEstoquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessaoComEmpresa();
  const [item, predios] = await Promise.all([
    prisma.itemEstoque.findUnique({
      where: { id, empresaId: session.empresaId },
      include: { movimentos: { orderBy: { data: "desc" } } },
    }),
    prisma.predio.findMany({
      where: { empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);
  if (!item) notFound();

  const action = updateItemEstoque.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Editar item de estoque</h1>
        <p className="text-sm text-slate-500">
          Quantidade atual: <span className="font-semibold text-slate-900">{item.quantidade}</span>
        </p>
      </div>
      <ItemForm action={action} defaultValues={item} submitLabel="Salvar alterações" isEdit />

      <div className="mt-10 max-w-2xl border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">Registrar entrada ou saída</h2>
        <p className="mt-1 text-sm text-slate-500">
          A quantidade em estoque é ajustada automaticamente e fica registrada
          no histórico abaixo.
        </p>
        <div className="mt-4">
          <MovimentoForm itemId={item.id} />
        </div>

        <h3 className="mt-8 text-sm font-semibold text-slate-700">Histórico de movimentações</h3>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Qtd.</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.movimentos.map((mov) => (
                <tr key={mov.id}>
                  <td className="px-4 py-3 text-slate-600">{formatDate(mov.data)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${tipoStyles[mov.tipo]}`}>
                      {tipoLabels[mov.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{mov.quantidade}</td>
                  <td className="px-4 py-3 text-slate-600">{mov.motivo}</td>
                </tr>
              ))}
              {item.movimentos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Nenhuma movimentação registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 max-w-2xl border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">Instalar em um prédio</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cria uma nova tela ativa no prédio escolhido e desconta 1 unidade
          deste item do estoque.
        </p>

        {item.quantidade < 1 ? (
          <p className="mt-4 text-sm text-slate-400">
            Sem unidades disponíveis em estoque para instalar.
          </p>
        ) : predios.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Cadastre um prédio primeiro para poder instalar telas nele.
          </p>
        ) : (
          <div className="mt-4">
            <InstalarForm itemId={item.id} itemNome={item.nome} predios={predios} />
          </div>
        )}
      </div>
    </div>
  );
}
