"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";

const updateSchema = z.object({
  apelido: z.string().optional(),
  telaId: z.string().optional(),
});

export type DispositivoState = { salvo?: boolean; telaNome?: string | null; error?: string };

export async function updateDispositivo(
  id: string,
  _prevState: DispositivoState,
  formData: FormData
): Promise<DispositivoState> {
  const session = await getSessaoComEmpresa();

  // Um dispositivo só pode ser editado por quem já o reivindicou (empresaId
  // igual) ou por qualquer dono, se ainda estiver sem dono (recém pareado).
  const existente = await prisma.dispositivo.findFirst({
    where: { id, OR: [{ empresaId: session.empresaId }, { empresaId: null }] },
  });
  if (!existente) {
    return { error: "Dispositivo não encontrado." };
  }

  const raw = Object.fromEntries(formData.entries());
  const data = updateSchema.parse(raw);

  // Vincular a uma Tela: a tela precisa ser desta empresa. Uma vez
  // reivindicado por um dono, o dispositivo continua sendo dele mesmo se
  // depois for desvinculado de uma tela específica.
  let telaId: string | null = null;
  if (data.telaId) {
    const tela = await prisma.tela.findUnique({
      where: { id: data.telaId, empresaId: session.empresaId },
    });
    if (!tela) {
      return { error: "Tela não encontrada." };
    }
    telaId = tela.id;
  }

  const dispositivo = await prisma.dispositivo.update({
    where: { id },
    data: {
      apelido: data.apelido || null,
      telaId,
      empresaId: telaId ? session.empresaId : existente.empresaId,
    },
    include: { tela: true },
  });

  await registrarLog({
    acao: "Editou dispositivo",
    entidade: "Dispositivo",
    entidadeId: dispositivo.id,
    descricao: `Vinculou o dispositivo "${dispositivo.apelido ?? dispositivo.deviceId}" à tela "${dispositivo.tela?.nome ?? "nenhuma"}".`,
  });

  revalidatePath("/painel/dispositivos");
  return { salvo: true, telaNome: dispositivo.tela?.nome ?? null };
}

export async function deleteDispositivo(id: string) {
  const session = await getSessaoComEmpresa();
  const dispositivo = await prisma.dispositivo.delete({
    where: { id, empresaId: session.empresaId },
  });
  await registrarLog({
    acao: "Excluiu dispositivo",
    entidade: "Dispositivo",
    entidadeId: id,
    descricao: `Excluiu o dispositivo "${dispositivo.apelido ?? dispositivo.deviceId}".`,
  });
  revalidatePath("/painel/dispositivos");
}
