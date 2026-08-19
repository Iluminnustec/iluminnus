import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CARGO_LABELS } from "@/lib/rbac";
import { updateEmpresaAtivo } from "../../actions";
import { AssinaturaForm } from "./assinatura-form";
import { PagamentoForm } from "./pagamento-form";
import { IndicadorSelect } from "./indicador-select";

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [empresa, indicadores] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id },
      include: {
        assinatura: { include: { pagamentos: { orderBy: { referencia: "desc" } } } },
        usuarios: { orderBy: { nome: "asc" } },
        licencas: { include: { app: true }, orderBy: { criadaEm: "asc" } },
        indicador: { select: { id: true, nome: true } },
      },
    }),
    prisma.indicador.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true, ativo: true } }),
  ]);
  if (!empresa) notFound();

  const toggleAtivo = updateEmpresaAtivo.bind(null, empresa.id, !empresa.ativo);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{empresa.nome}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {empresa.dominio ?? "sem domínio configurado"}
            {empresa.cidade && ` · ${empresa.cidade}${empresa.estado ? `/${empresa.estado}` : ""}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {empresa.licencas.map((licenca) => (
              <span
                key={licenca.id}
                className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600 select-all"
                title={`Licença do app ${licenca.app.nome}`}
              >
                {licenca.app.nome}: {licenca.codigo}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-sans font-medium ${
                    licenca.status === "ATIVA"
                      ? "bg-green-100 text-green-700"
                      : licenca.status === "SUSPENSA"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {licenca.status}
                </span>
              </span>
            ))}
          </div>
        </div>
        <form action={toggleAtivo}>
          <button
            type="submit"
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              empresa.ativo
                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {empresa.ativo ? "Bloquear acesso" : "Reativar acesso"}
          </button>
        </form>
      </div>

      {!empresa.ativo && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Esta empresa está bloqueada — ninguém do time dela consegue acessar o painel até você
          reativar.
        </p>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Indicação</h2>
        <p className="mt-1 text-xs text-slate-500">
          Se essa empresa veio por indicação de alguém, o indicador recebe comissão sobre cada
          pagamento de assinatura registrado aqui.
        </p>
        <div className="mt-4">
          <IndicadorSelect
            empresaId={empresa.id}
            indicadorAtualId={empresa.indicador?.id ?? ""}
            indicadores={indicadores}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Assinatura</h2>
        {empresa.assinatura?.trialAte && (
          <p className="mt-1 text-xs text-slate-500">
            Teste grátis até {empresa.assinatura.trialAte.toLocaleDateString("pt-BR")}.
          </p>
        )}
        <div className="mt-4">
          {empresa.assinatura ? (
            <AssinaturaForm assinatura={empresa.assinatura} />
          ) : (
            <p className="text-sm text-slate-500">Esta empresa não tem assinatura cadastrada.</p>
          )}
        </div>
      </section>

      {empresa.assinatura && (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Registrar pagamento</h2>
          <div className="mt-4">
            <PagamentoForm assinaturaId={empresa.assinatura.id} empresaId={empresa.id} />
          </div>

          {empresa.assinatura.pagamentos.length > 0 && (
            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Referência</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Registrado em</th>
                    <th className="px-4 py-3">Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empresa.assinatura.pagamentos.map((pagamento) => (
                    <tr key={pagamento.id}>
                      <td className="px-4 py-3 text-slate-600">
                        {pagamento.referencia.toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        R$ {pagamento.valor.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {pagamento.dataPagamento.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{pagamento.registradoPor ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Usuários dessa empresa</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Cargo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empresa.usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-4 py-3 text-slate-900">{usuario.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{usuario.email}</td>
                  <td className="px-4 py-3 text-slate-600">{CARGO_LABELS[usuario.cargo]}</td>
                </tr>
              ))}
              {empresa.usuarios.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
