import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CARGO_LABELS } from "@/lib/rbac";
import { EditIcon } from "@/components/edit-icon";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function UsuariosPage() {
  const session = await getSessaoComEmpresa();
  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: session.empresaId },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quem tem acesso ao painel e o que cada um pode ver.
          </p>
        </div>
        <Link
          href="/painel/usuarios/novo"
          className="rounded-md bg-telas-navy px-4 py-2 text-sm font-medium text-white hover:bg-telas-navy-light"
        >
          Novo usuário
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Código de indicação</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/usuarios/${usuario.id}`}
                    className="group font-medium text-slate-900 hover:text-telas-navy-light"
                  >
                    {usuario.nome}
                    <EditIcon className="ml-1.5 text-slate-300 group-hover:text-telas-navy-light" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{usuario.email}</td>
                <td className="px-4 py-3 text-slate-600">{CARGO_LABELS[usuario.cargo]}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {usuario.codigoReferral ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      usuario.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
