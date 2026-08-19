import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DespesaForm } from "../despesa-form";
import { updateDespesa, marcarParcelaPaga, marcarReembolsado, deleteDespesa } from "../actions";
import { DeleteButton } from "@/components/delete-button";
import { getSessaoComEmpresa } from "@/lib/auth";

const statusStyles: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  PAGO: "bg-green-100 text-green-700",
  ATRASADO: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ATRASADO: "Atrasado",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function EditarDespesaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessaoComEmpresa();
  const [despesa, usuarios] = await Promise.all([
    prisma.despesa.findUnique({
      where: { id, empresaId: session.empresaId },
      include: { parcelas: { orderBy: { numero: "asc" } }, pagoPorSocio: true },
    }),
    prisma.usuario.findMany({
      where: { ativo: true, empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  if (!despesa) notFound();

  const action = updateDespesa.bind(null, id);
  const deleteAction = deleteDespesa.bind(null, id);
  const reembolsarAction = marcarReembolsado.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Editar despesa</h1>
        <DeleteButton
          action={deleteAction}
          confirmMessage={`Excluir a despesa "${despesa.descricao}"? Isso também apaga todas as ${despesa.parcelas.length} parcelas dela. Essa ação não pode ser desfeita.`}
          label="Excluir despesa"
        />
      </div>

      {despesa.pagoPorSocio && (
        <div
          className={`mt-4 max-w-2xl rounded-lg border px-4 py-3 text-sm ${
            despesa.reembolsado
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {despesa.reembolsado ? (
            <p>
              ✓ Reembolsado a <strong>{despesa.pagoPorSocio.nome}</strong> em{" "}
              {despesa.dataReembolso?.toLocaleDateString("pt-BR", { timeZone: "UTC" })}.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p>
                Adiantado por <strong>{despesa.pagoPorSocio.nome}</strong> — a empresa ainda
                deve devolver esse valor.
              </p>
              <form action={reembolsarAction}>
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Marcar como reembolsado
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <DespesaForm
        action={action}
        usuarios={usuarios}
        defaultValues={despesa}
        submitLabel="Salvar alterações"
        isEdit
      />

      <div className="mt-10 max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-900">
          Parcelas ({despesa.parcelas.length})
        </h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {despesa.parcelas.map((parcela) => (
                <tr key={parcela.id}>
                  <td className="px-4 py-3 text-slate-600">{parcela.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(parcela.vencimento)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {formatBRL(parcela.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[parcela.status]}`}
                    >
                      {statusLabels[parcela.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {parcela.status !== "PAGO" && (
                      <form
                        action={async () => {
                          "use server";
                          await marcarParcelaPaga(parcela.id);
                        }}
                      >
                        <button className="text-xs font-medium text-slate-500 hover:text-green-700">
                          Marcar paga
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
