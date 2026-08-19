"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, rotaInicial } from "@/lib/auth";
import { registrarLog } from "@/lib/log";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { error: "Informe e-mail e senha." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return { error: "E-mail ou senha inválidos." };
  }

  if (!usuario.ativo) {
    return { error: "Este usuário está desativado. Fale com o administrador." };
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSession({
    userId: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    cargo: usuario.cargo,
    empresaId: usuario.empresaId,
  });

  await registrarLog({
    acao: "Login",
    entidade: "Usuario",
    entidadeId: usuario.id,
    descricao: `${usuario.nome} entrou no painel.`,
  });

  redirect(rotaInicial(usuario.cargo));
}
