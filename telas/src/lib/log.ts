import "server-only";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function registrarLog(params: {
  acao: string;
  entidade: string;
  entidadeId?: string;
  descricao: string;
}) {
  const session = await getSession();
  await prisma.logAtividade.create({
    data: {
      usuarioNome: session?.nome ?? "Desconhecido",
      usuarioEmail: session?.email ?? "desconhecido",
      acao: params.acao,
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      descricao: params.descricao,
      empresaId: session?.empresaId ?? null,
    },
  });
}
