"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";

const predioSchema = z.object({
  nome: z.string().min(1, "Informe o nome do prédio."),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  sindicoNome: z.string().optional(),
  sindicoContato: z.string().optional(),
  observacoes: z.string().optional(),
});

export type PredioState = { error?: string };

function parsePredioForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  if (raw.latitude === "") delete raw.latitude;
  if (raw.longitude === "") delete raw.longitude;
  const parsed = predioSchema.parse(raw);
  return {
    ...parsed,
    latitude: parsed.latitude ?? null,
    longitude: parsed.longitude ?? null,
  };
}

export async function createPredio(
  _prevState: PredioState,
  formData: FormData
): Promise<PredioState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parsePredioForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const predio = await prisma.predio.create({ data: { ...data, empresaId: session.empresaId } });
  await registrarLog({
    acao: "Criou prédio",
    entidade: "Predio",
    entidadeId: predio.id,
    descricao: `Criou o prédio ${predio.nome}.`,
  });
  revalidatePath("/painel/predios");
  redirect("/painel/predios");
}

export async function updatePredio(
  id: string,
  _prevState: PredioState,
  formData: FormData
): Promise<PredioState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parsePredioForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const predio = await prisma.predio.update({
    where: { id, empresaId: session.empresaId },
    data,
  });
  await registrarLog({
    acao: "Editou prédio",
    entidade: "Predio",
    entidadeId: predio.id,
    descricao: `Editou o prédio ${predio.nome}.`,
  });
  revalidatePath("/painel/predios");
  redirect("/painel/predios");
}
