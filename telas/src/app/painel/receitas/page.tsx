import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";
import { marcarComoPago } from "./actions";
import { getSessaoComEmpresa } from "@/lib/auth";

const statusStyles: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  PAGO: "bg-green-100 text-green-700",
  ATRASADO: "bg-red-100 text-red-700",
  CANCELADO: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function ReceitasPage() {
  const session = await getSessaoComEmpresa();
  const cobrancas = await prisma.cobranca.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { vencimento: "asc" },
    include: { cliente: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Receitas</h1>
          <p className="mt-1 text-sm text-slate-500">Cobranças e faturamento dos anunciantes.</p>
        </div>
        <Link
          href="/painel/receitas/novo"
          className="rounded-md bg-telas-navy px-4 py-2 text-sm font-medium text-white hover:bg-telas-navy-light"
        >
          Nova cobrança
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cobrancas.map((cobranca) => (
              <tr key={cobranca.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/receitas/${cobranca.id}`}
                    className="group font-medium text-slate-900 hover:text-telas-navy-light"
                  >
                    {cobranca.descricao}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-telas-navy-light" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{cobranca.cliente.nome}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(cobranca.vencimento)}</td>
                <td className="px-4 py-3 text-slate-600">{formatBRL(cobranca.valor)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[cobranca.status]}`}
                  >
                    {statusLabels[cobranca.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {cobranca.status !== "PAGO" && (
                    <form
                      action={async () => {
                        "use server";
                        await marcarComoPago(cobranca.id);
                      }}
                    >
                      <button className="text-xs font-medium text-slate-500 hover:text-green-700">
                        Marcar pago
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {cobrancas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Nenhuma cobrança cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
