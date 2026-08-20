"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";
import { gerarTokenAtivacao, linkAtivacaoCliente, linkWhatsapp } from "@/lib/ativacao";

const clienteSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  razaoSocial: z.string().optional(),
  cnpjCpf: z.string().optional(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  planoTelas: z.coerce.number().int().min(0).optional(),
  vendedorId: z.string().optional(),
  observacoes: z.string().optional(),
});

export type ClienteState = {
  error?: string;
  sucesso?: {
    nome: string;
    linkAtivacao: string;
    whatsappHref: string | null;
    mailtoHref: string | null;
  };
};

function parseClienteForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  if (raw.planoTelas === "") delete raw.planoTelas;
  const parsed = clienteSchema.parse(raw);
  return { ...parsed, vendedorId: parsed.vendedorId || null };
}

// O cliente sai daqui sem senha (só a equipe preencheu os dados). Pra ele
// conseguir logar depois, gera um link de ativação de uso único (token) e
// devolve pronto pra equipe mandar por WhatsApp/e-mail -- não existe envio
// automático ainda, quem dispara é a própria equipe, na hora.
export async function createCliente(
  _prevState: ClienteState,
  formData: FormData
): Promise<ClienteState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseClienteForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  // Vendedor em campo (cargo VENDAS) sempre fica vinculado a si mesmo --
  // não escolhe manualmente, evita erro/fraude de atribuir a outro vendedor.
  if (session.cargo === "VENDAS") {
    data.vendedorId = session.userId;
  }

  const tokenAtivacao = gerarTokenAtivacao();

  const cliente = await prisma.cliente.create({
    data: { ...data, empresaId: session.empresaId, tokenAtivacao },
  });
  await registrarLog({
    acao: "Criou cliente",
    entidade: "Cliente",
    entidadeId: cliente.id,
    descricao: `Criou o cliente ${cliente.nome}.`,
  });
  revalidatePath("/painel/clientes");

  const linkAtivacao = linkAtivacaoCliente(tokenAtivacao);
  const mensagem = `Olá, ${data.nome}! Pra finalizar seu cadastro, definir sua senha e acompanhar sua campanha, acesse: ${linkAtivacao}`;

  return {
    sucesso: {
      nome: data.nome,
      linkAtivacao,
      whatsappHref: data.telefone ? linkWhatsapp(data.telefone, mensagem) : null,
      mailtoHref: data.email
        ? `mailto:${data.email}?subject=${encodeURIComponent("Finalize seu cadastro")}&body=${encodeURIComponent(mensagem)}`
        : null,
    },
  };
}

export async function updateCliente(
  id: string,
  _prevState: ClienteState,
  formData: FormData
): Promise<ClienteState> {
  const session = await getSessaoComEmpresa();
  if (session.cargo === "VENDAS") {
    return { error: 'Vendedores não editam cliente direto — use "Solicitar alteração".' };
  }

  let data;
  try {
    data = parseClienteForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const cliente = await prisma.cliente.update({
    where: { id, empresaId: session.empresaId },
    data,
  });
  await registrarLog({
    acao: "Editou cliente",
    entidade: "Cliente",
    entidadeId: cliente.id,
    descricao: `Editou o cliente ${cliente.nome}.`,
  });
  revalidatePath("/painel/clientes");
  redirect("/painel/clientes");
}

// Campos que um vendedor pode propor mudar num cliente existente (tudo
// exceto vendedorId -- esse só muda por vínculo automático ou decisão do
// supervisor, nunca por solicitação).
const camposSolicitacaoSchema = clienteSchema.omit({ vendedorId: true });
export type CamposSolicitacao = z.infer<typeof camposSolicitacaoSchema>;

export type SolicitacaoState = { error?: string };

export async function solicitarAlteracaoCliente(
  clienteId: string,
  _prevState: SolicitacaoState,
  formData: FormData
): Promise<SolicitacaoState> {
  const session = await getSessaoComEmpresa();

  const raw = Object.fromEntries(formData.entries());
  if (raw.planoTelas === "") delete raw.planoTelas;
  let camposNovos;
  try {
    camposNovos = camposSolicitacaoSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const pendente = await prisma.solicitacaoAlteracaoCliente.findFirst({
    where: { clienteId, empresaId: session.empresaId, status: "PENDENTE" },
  });
  if (pendente) {
    return { error: "Já existe uma solicitação pendente para este cliente. Aguarde a análise." };
  }

  const motivo = String(formData.get("motivo") ?? "").trim();
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId, empresaId: session.empresaId },
  });
  if (!cliente) return { error: "Cliente não encontrado." };

  await prisma.solicitacaoAlteracaoCliente.create({
    data: {
      empresaId: session.empresaId,
      clienteId,
      solicitanteId: session.userId,
      camposNovos,
      motivo: motivo || null,
    },
  });

  await registrarLog({
    acao: "Solicitou alteração de cliente",
    entidade: "Cliente",
    entidadeId: clienteId,
    descricao: `${session.nome} solicitou alteração no cadastro de "${cliente.nome}".`,
  });

  revalidatePath(`/painel/clientes/${clienteId}`);
  revalidatePath("/painel/solicitacoes");
  redirect(`/painel/clientes/${clienteId}?enviado=1`);
}

async function exigirRevisor() {
  const session = await getSessaoComEmpresa();
  if (!["ADMIN", "SUPERVISOR", "SOCIO"].includes(session.cargo)) {
    throw new Error("Apenas administradores, supervisores ou sócios podem revisar solicitações.");
  }
  return session;
}

export async function aprovarSolicitacao(id: string) {
  const session = await exigirRevisor();

  const solicitacao = await prisma.solicitacaoAlteracaoCliente.findUnique({
    where: { id, empresaId: session.empresaId },
    include: { cliente: true, solicitante: true },
  });
  if (!solicitacao || solicitacao.status !== "PENDENTE") return;

  const camposNovos = solicitacao.camposNovos as CamposSolicitacao;

  await prisma.$transaction([
    prisma.cliente.update({ where: { id: solicitacao.clienteId }, data: camposNovos }),
    prisma.solicitacaoAlteracaoCliente.update({
      where: { id },
      data: { status: "APROVADA", revisadoPorId: session.userId, revisadoEm: new Date() },
    }),
  ]);

  await registrarLog({
    acao: "Aprovou solicitação de alteração",
    entidade: "Cliente",
    entidadeId: solicitacao.clienteId,
    descricao: `Aprovou a alteração de "${solicitacao.cliente.nome}" solicitada por ${solicitacao.solicitante.nome}.`,
  });

  revalidatePath("/painel/solicitacoes");
  revalidatePath("/painel/clientes");
  revalidatePath(`/painel/clientes/${solicitacao.clienteId}`);
}

export async function recusarSolicitacao(id: string) {
  const session = await exigirRevisor();

  const solicitacao = await prisma.solicitacaoAlteracaoCliente.update({
    where: { id, empresaId: session.empresaId },
    data: { status: "RECUSADA", revisadoPorId: session.userId, revisadoEm: new Date() },
    include: { cliente: true, solicitante: true },
  });

  await registrarLog({
    acao: "Recusou solicitação de alteração",
    entidade: "Cliente",
    entidadeId: solicitacao.clienteId,
    descricao: `Recusou a alteração de "${solicitacao.cliente.nome}" solicitada por ${solicitacao.solicitante.nome}.`,
  });

  revalidatePath("/painel/solicitacoes");
}

export async function toggleClienteAtivo(id: string, ativo: boolean) {
  const session = await getSessaoComEmpresa();
  const cliente = await prisma.cliente.update({
    where: { id, empresaId: session.empresaId },
    data: { ativo: !ativo },
  });
  await registrarLog({
    acao: cliente.ativo ? "Ativou cliente" : "Desativou cliente",
    entidade: "Cliente",
    entidadeId: cliente.id,
    descricao: `${cliente.ativo ? "Ativou" : "Desativou"} o cliente ${cliente.nome}.`,
  });
  revalidatePath("/painel/clientes");
}
