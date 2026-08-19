import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";
import { getSessaoComEmpresa } from "@/lib/auth";

const statusStyles: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-700",
  EM_USO: "bg-blue-100 text-blue-700",
  MANUTENCAO: "bg-amber-100 text-amber-700",
  BAIXADO: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  EM_USO: "Em uso",
  MANUTENCAO: "Manutenção",
  BAIXADO: "Baixado",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EstoquePage() {
  const session = await getSessaoComEmpresa();
  const itens = await prisma.itemEstoque.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
          <p className="mt-1 text-sm text-slate-500">
            Telas, players e equipamentos comprados e disponíveis.
          </p>
        </div>
        <Link
          href="/painel/estoque/novo"
          className="rounded-md bg-brivox-navy px-4 py-2 text-sm font-medium text-white hover:bg-brivox-navy-light"
        >
          Novo item
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Quantidade</th>
              <th className="px-4 py-3">Valor unitário</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {itens.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/estoque/${item.id}`}
                    className="group font-medium text-slate-900 hover:text-brivox-navy-light"
                  >
                    {item.nome}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-brivox-navy-light" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.categoria || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{item.quantidade}</td>
                <td className="px-4 py-3 text-slate-600">
                  {item.valorUnitario != null ? formatBRL(item.valorUnitario) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  Nenhum item cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
