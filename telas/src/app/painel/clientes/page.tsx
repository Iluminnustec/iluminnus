import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EditIcon } from "@/components/edit-icon";
import { toggleClienteAtivo } from "./actions";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function ClientesPage() {
  const session = await getSessaoComEmpresa();
  const clientes = await prisma.cliente.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Anunciantes que contratam pacotes de veiculação na rede Brivox.
          </p>
        </div>
        <Link
          href="/painel/clientes/novo"
          className="rounded-md bg-brivox-navy px-4 py-2 text-sm font-medium text-white hover:bg-brivox-navy-light"
        >
          Novo cliente
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Pacote</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/clientes/${cliente.id}`}
                    className="group font-medium text-slate-900 hover:text-brivox-navy-light"
                  >
                    {cliente.nome}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-brivox-navy-light" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {cliente.telefone || cliente.email || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{cliente.cidade || "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {cliente.planoTelas ? `${cliente.planoTelas} telas` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      cliente.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cliente.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await toggleClienteAtivo(cliente.id, cliente.ativo);
                    }}
                  >
                    <button className="text-xs font-medium text-slate-500 hover:text-slate-900">
                      {cliente.ativo ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Nenhum cliente cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
