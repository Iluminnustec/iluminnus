"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";

export async function aprovarProposta(id: string) {
  const session = await getSessaoComEmpresa();
  const proposta = await prisma.proposta.update({
    where: { id, empresaId: session.empresaId },
    data: { status: "APROVADA" },
    include: { cliente: true },
  });
  await registrarLog({
    acao: "Aprovou proposta",
    entidade: "Proposta",
    entidadeId: id,
    descricao: `Aprovou a proposta de ${proposta.cliente.nome} (R$ ${proposta.valorTotal.toFixed(2)}/mês).`,
  });
  revalidatePath("/painel/propostas");
}

export async function recusarProposta(id: string) {
  const session = await getSessaoComEmpresa();
  const proposta = await prisma.proposta.update({
    where: { id, empresaId: session.empresaId },
    data: { status: "RECUSADA" },
    include: { cliente: true },
  });
  await registrarLog({
    acao: "Recusou proposta",
    entidade: "Proposta",
    entidadeId: id,
    descricao: `Recusou a proposta de ${proposta.cliente.nome} (R$ ${proposta.valorTotal.toFixed(2)}/mês).`,
  });
  revalidatePath("/painel/propostas");
}
