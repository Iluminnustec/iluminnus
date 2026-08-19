"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";

const telaSchema = z.object({
  nome: z.string().min(1, "Informe o nome da tela."),
  predioId: z.string().min(1, "Selecione o prédio."),
  tipo: z.enum(["TV_ELEVADOR", "TOTEM_HALL", "TELA_HORIZONTAL", "OUTRO"]),
  status: z.enum(["ATIVA", "INATIVA", "MANUTENCAO"]),
  rotacao: z.coerce.number().int().default(0),
  precoBase: z.coerce.number().min(0).default(110),
  especificacoes: z.string().optional(),
  observacoes: z.string().optional(),
});

export type TelaState = { error?: string };

function parseTelaForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return telaSchema.parse(raw);
}

export async function createTela(
  _prevState: TelaState,
  formData: FormData
): Promise<TelaState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseTelaForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const predio = await prisma.predio.findUnique({
    where: { id: data.predioId, empresaId: session.empresaId },
  });
  if (!predio) {
    return { error: "Prédio não encontrado." };
  }

  const tela = await prisma.tela.create({ data: { ...data, empresaId: session.empresaId } });
  await registrarLog({
    acao: "Criou tela",
    entidade: "Tela",
    entidadeId: tela.id,
    descricao: `Criou a tela ${tela.nome}.`,
  });
  revalidatePath("/painel/telas");
  revalidatePath("/painel/predios");
  redirect("/painel/telas");
}

const loteSchema = z.object({
  predioId: z.string().min(1),
  nomes: z.string().min(1, "Informe pelo menos um nome."),
  tipo: z.enum(["TV_ELEVADOR", "TOTEM_HALL", "TELA_HORIZONTAL", "OUTRO"]),
});

export type CriarTelasEmLoteState = { error?: string };

// Cria varias telas de uma vez pro mesmo predio — util quando o predio tem
// mais de um elevador (ex: "Social, Servico" vira 2 telas separadas).
export async function criarTelasEmLote(
  predioId: string,
  _prevState: CriarTelasEmLoteState,
  formData: FormData
): Promise<CriarTelasEmLoteState> {
  const session = await getSessaoComEmpresa();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = loteSchema.parse({ ...raw, predioId });
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const nomes = data.nomes
    .split(/[,\n]/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  if (nomes.length === 0) {
    return { error: "Informe pelo menos um nome de tela." };
  }

  const predio = await prisma.predio.findUnique({
    where: { id: predioId, empresaId: session.empresaId },
  });
  if (!predio) {
    return { error: "Prédio não encontrado." };
  }

  const criadas = await prisma.$transaction(
    nomes.map((nome) =>
      prisma.tela.create({ data: { nome, predioId, tipo: data.tipo, empresaId: session.empresaId } })
    )
  );

  await registrarLog({
    acao: "Criou telas em lote",
    entidade: "Predio",
    entidadeId: predioId,
    descricao: `Criou ${criadas.length} tela(s) em "${predio.nome}": ${nomes.join(", ")}.`,
  });

  revalidatePath("/painel/telas");
  revalidatePath(`/painel/predios/${predioId}`);
  return {};
}

export async function updateTela(
  id: string,
  _prevState: TelaState,
  formData: FormData
): Promise<TelaState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseTelaForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const predio = await prisma.predio.findUnique({
    where: { id: data.predioId, empresaId: session.empresaId },
  });
  if (!predio) {
    return { error: "Prédio não encontrado." };
  }

  const tela = await prisma.tela.update({ where: { id, empresaId: session.empresaId }, data });
  await registrarLog({
    acao: "Editou tela",
    entidade: "Tela",
    entidadeId: tela.id,
    descricao: `Editou a tela ${tela.nome}.`,
  });
  revalidatePath("/painel/telas");
  revalidatePath("/painel/predios");
  redirect("/painel/telas");
}
