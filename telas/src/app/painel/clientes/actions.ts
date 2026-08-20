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
