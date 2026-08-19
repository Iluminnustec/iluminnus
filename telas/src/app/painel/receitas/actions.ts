"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";

const cobrancaSchema = z.object({
  descricao: z.string().min(1, "Informe a descrição."),
  clienteId: z.string().min(1, "Selecione o cliente."),
  valor: z.coerce.number().positive("Informe um valor válido."),
  vencimento: z.coerce.date({ error: "Informe a data de vencimento." }),
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"]),
  observacoes: z.string().optional(),
});

export type CobrancaState = { error?: string };

function parseCobrancaForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return cobrancaSchema.parse(raw);
}

export async function createCobranca(
  _prevState: CobrancaState,
  formData: FormData
): Promise<CobrancaState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseCobrancaForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: data.clienteId, empresaId: session.empresaId },
  });
  if (!cliente) {
    return { error: "Cliente não encontrado." };
  }

  const cobranca = await prisma.cobranca.create({
    data: { ...data, empresaId: session.empresaId },
  });
  await registrarLog({
    acao: "Criou cobrança",
    entidade: "Cobranca",
    entidadeId: cobranca.id,
    descricao: `Criou a cobrança "${cobranca.descricao}".`,
  });
  revalidatePath("/painel/receitas");
  redirect("/painel/receitas");
}

export async function updateCobranca(
  id: string,
  _prevState: CobrancaState,
  formData: FormData
): Promise<CobrancaState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseCobrancaForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: data.clienteId, empresaId: session.empresaId },
  });
  if (!cliente) {
    return { error: "Cliente não encontrado." };
  }

  const cobranca = await prisma.cobranca.update({
    where: { id, empresaId: session.empresaId },
    data: {
      ...data,
      dataPagamento: data.status === "PAGO" ? new Date() : null,
    },
  });
  await registrarLog({
    acao: "Editou cobrança",
    entidade: "Cobranca",
    entidadeId: cobranca.id,
    descricao: `Editou a cobrança "${cobranca.descricao}".`,
  });
  revalidatePath("/painel/receitas");
  redirect("/painel/receitas");
}

export async function deleteCobranca(id: string) {
  const session = await getSessaoComEmpresa();
  const cobranca = await prisma.cobranca.delete({ where: { id, empresaId: session.empresaId } });
  await registrarLog({
    acao: "Excluiu cobrança",
    entidade: "Cobranca",
    entidadeId: id,
    descricao: `Excluiu a cobrança "${cobranca.descricao}" (${cobranca.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}).`,
  });
  revalidatePath("/painel/receitas");
  redirect("/painel/receitas");
}

export async function marcarComoPago(id: string) {
  const session = await getSessaoComEmpresa();
  const cobranca = await prisma.cobranca.update({
    where: { id, empresaId: session.empresaId },
    data: { status: "PAGO", dataPagamento: new Date() },
  });
  await registrarLog({
    acao: "Marcou cobrança como paga",
    entidade: "Cobranca",
    entidadeId: cobranca.id,
    descricao: `Marcou "${cobranca.descricao}" como paga.`,
  });
  revalidatePath("/painel/receitas");
}
