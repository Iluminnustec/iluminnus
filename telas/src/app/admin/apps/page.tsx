import { prisma } from "@/lib/prisma";

const STATUS_CLASSES: Record<string, string> = {
  ATIVA: "bg-green-100 text-green-700",
  SUSPENSA: "bg-amber-100 text-amber-700",
  CANCELADA: "bg-slate-100 text-slate-500",
};

const STATUS_LABEL: Record<string, string> = {
  ATIVA: "Ativa",
  SUSPENSA: "Suspensa",
  CANCELADA: "Cancelada",
};

export default async function AdminAppsPage() {
  const apps = await prisma.app.findMany({
    orderBy: { nome: "asc" },
    include: {
      licencas: {
        orderBy: { criadaEm: "asc" },
        include: { empresa: { select: { id: true, nome: true, ativo: true } } },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Apps e licenças</h1>
      <p className="mt-1 text-sm text-slate-500">
        Registro central da Iluminnus: qual empresa tem licença pra qual app.
      </p>

      <div className="mt-6 space-y-6">
        {apps.map((app) => {
          const ativas = app.licencas.filter((l) => l.status === "ATIVA" && l.empresa.ativo).length;
          return (
            <section key={app.id} className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{app.nome}</h2>
                  <p className="text-xs text-slate-500">{app.slug}</p>
                </div>
                <span className="rounded-full bg-iluminnus-navy/5 px-3 py-1 text-xs font-medium text-iluminnus-navy">
                  {ativas} {ativas === 1 ? "cliente ativo" : "clientes ativos"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Empresa</th>
                      <th className="px-5 py-3">Código da licença</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Desde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {app.licencas.map((licenca) => (
                      <tr key={licenca.id}>
                        <td className="px-5 py-3">
                          <a
                            href={`/admin/empresas/${licenca.empresa.id}`}
                            className="font-medium text-slate-900 hover:text-iluminnus-gold"
                          >
                            {licenca.empresa.nome}
                          </a>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-600">
                          {licenca.codigo}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASSES[licenca.status]}`}
                          >
                            {STATUS_LABEL[licenca.status]}
                          </span>
                          {!licenca.empresa.ativo && (
                            <span className="ml-1.5 rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-white">
                              Empresa bloqueada
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {licenca.criadaEm.toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                    {app.licencas.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                          Nenhuma empresa com licença desse app ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
        {apps.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">
            Nenhum app cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
