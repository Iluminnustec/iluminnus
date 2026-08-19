import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PredioForm } from "../predio-form";
import { updatePredio } from "../actions";
import { CriarTelasLoteForm } from "@/components/criar-telas-lote-form";
import { getSessaoComEmpresa } from "@/lib/auth";

const statusStyles: Record<string, string> = {
  ATIVA: "bg-green-100 text-green-700",
  INATIVA: "bg-slate-100 text-slate-500",
  MANUTENCAO: "bg-amber-100 text-amber-700",
};

const tipoLabels: Record<string, string> = {
  TV_ELEVADOR: "TV no elevador",
  TOTEM_HALL: "Totem no hall",
  TELA_HORIZONTAL: "Tela horizontal",
  OUTRO: "Outro",
};

export default async function EditarPredioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessaoComEmpresa();
  const predio = await prisma.predio.findUnique({
    where: { id, empresaId: session.empresaId },
    include: { telas: { orderBy: { nome: "asc" } } },
  });

  if (!predio) notFound();

  const action = updatePredio.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Editar prédio</h1>
      <PredioForm action={action} defaultValues={predio} submitLabel="Salvar alterações" />

      <div className="mt-10 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Telas instaladas ({predio.telas.length})
          </h2>
          <Link
            href="/painel/estoque"
            className="text-sm font-medium text-brivox-navy-light hover:underline"
          >
            Instalar tela do estoque →
          </Link>
        </div>

        <div className="mt-4">
          <CriarTelasLoteForm predioId={predio.id} />
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Tela</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {predio.telas.map((tela) => (
                <tr key={tela.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/painel/telas/${tela.id}`}
                      className="font-medium text-slate-900 hover:text-brivox-navy-light"
                    >
                      {tela.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{tipoLabels[tela.tipo]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[tela.status]}`}
                    >
                      {tela.status}
                    </span>
                  </td>
                </tr>
              ))}
              {predio.telas.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-400">
                    Nenhuma tela instalada neste prédio ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
