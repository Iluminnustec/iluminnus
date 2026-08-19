"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { registrarLog } from "@/lib/log";

export type SenhaState = { error?: string; success?: boolean };

export async function alterarSenha(
  _prevState: SenhaState,
  formData: FormData
): Promise<SenhaState> {
  const session = await getSession();
  if (!session) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (novaSenha.length < 8) {
    return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  }
  if (novaSenha !== confirmarSenha) {
    return { error: "A confirmação não bate com a nova senha." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: session.userId } });
  if (!usuario) {
    return { error: "Usuário não encontrado." };
  }

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
  if (!senhaValida) {
    return { error: "Senha atual incorreta." };
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senhaHash },
  });

  await registrarLog({
    acao: "Alterou a própria senha",
    entidade: "Usuario",
    entidadeId: usuario.id,
    descricao: `${usuario.nome} trocou a própria senha.`,
  });

  return { success: true };
}
