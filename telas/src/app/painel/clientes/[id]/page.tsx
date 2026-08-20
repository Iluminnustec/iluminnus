import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClienteForm } from "../cliente-form";
import {
  updateCliente,
  solicitarAlteracaoCliente,
  aprovarSolicitacao,
  recusarSolicitacao,
} from "../actions";
import { getSessaoComEmpresa } from "@/lib/auth";

const CAMPO_LABELS: Record<string, string> = {
  nome: "Nome",
  razaoSocial: "Razão social",
  cnpjCpf: "CNPJ/CPF",
  email: "E-mail",
  telefone: "Telefone",
  endereco: "Endereço",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  cep: "CEP",
  planoTelas: "Pacote (qtd. de telas)",
  observacoes: "Observações",
};

export default async function EditarClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enviado?: string }>;
}) {
  const { id } = await params;
  const { enviado } = await searchParams;
  const session = await getSessaoComEmpresa();

  const [cliente, vendedores, solicitacaoPendente] = await Promise.all([
    prisma.cliente.findUnique({ where: { id, empresaId: session.empresaId } }),
    prisma.usuario.findMany({
      where: { ativo: true, empresaId: session.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.solicitacaoAlteracaoCliente.findFirst({
      where: { clienteId: id, empresaId: session.empresaId, status: "PENDENTE" },
      include: { solicitante: { select: { nome: true } } },
    }),
  ]);
  if (!cliente) notFound();

  const ehVendedor = session.cargo === "VENDAS";
  const podeRevisar = ["ADMIN", "SUPERVISOR", "SOCIO"].includes(session.cargo);

  if (ehVendedor) {
    const acaoSolicitar = solicitarAlteracaoCliente.bind(null, id);
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{cliente.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vendedores não editam o cadastro direto — proponha os campos novos abaixo e um
          supervisor aprova.
        </p>

        {enviado && solicitacaoPendente ? (
          <div className="mt-6 max-w-2xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Solicitação enviada! Um supervisor vai revisar e aprovar em breve — assim que
            acontecer, os dados do cliente são atualizados automaticamente.
          </div>
        ) : solicitacaoPendente ? (
          <div className="mt-6 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Já existe uma solicitação sua pendente de análise (enviada por{" "}
            {solicitacaoPendente.solicitante.nome}). Aguarde a aprovação antes de enviar outra.
          </div>
        ) : (
          <ClienteForm
            action={acaoSolicitar}
            vendedores={vendedores}
            ocultarVendedor
            mostrarMotivo
            defaultValues={cliente}
            submitLabel="Enviar solicitação"
          />
        )}
      </div>
    );
  }

  const action = updateCliente.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Editar cliente</h1>

      {solicitacaoPendente && podeRevisar && (
        <div className="mt-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-medium text-amber-800">
            {solicitacaoPendente.solicitante.nome} solicitou uma alteração neste cliente.
          </p>
          <ul className="mt-2 space-y-1 text-amber-800">
            {Object.entries(solicitacaoPendente.camposNovos as Record<string, unknown>).map(
              ([campo, valor]) => (
                <li key={campo}>
                  <span className="font-medium">{CAMPO_LABELS[campo] ?? campo}:</span>{" "}
                  {String(valor || "—")}
                </li>
              )
            )}
          </ul>
          {solicitacaoPendente.motivo && (
            <p className="mt-2 italic text-amber-700">"{solicitacaoPendente.motivo}"</p>
          )}
          <div className="mt-3 flex gap-2">
            <form action={recusarSolicitacao.bind(null, solicitacaoPendente.id)}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Recusar
              </button>
            </form>
            <form action={aprovarSolicitacao.bind(null, solicitacaoPendente.id)}>
              <button
                type="submit"
                className="rounded-md bg-telas-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-telas-navy-light"
              >
                Aprovar
              </button>
            </form>
          </div>
        </div>
      )}

      <ClienteForm
        action={action}
        vendedores={vendedores}
        defaultValues={cliente}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
