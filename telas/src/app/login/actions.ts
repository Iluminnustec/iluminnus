"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, rotaInicial } from "@/lib/auth";
import { createClienteSession } from "@/lib/auth-cliente";
import { registrarLog } from "@/lib/log";

export type LoginState = {
  error?: string;
};

// Login único do Telas: um mesmo e-mail/senha serve pra staff (Usuario --
// super-admin, admin, supervisor, vendas, sócio) e pra clientes/anunciantes
// (Cliente, tabela separada, sessão separada). Tenta Usuario primeiro; se
// não achar, tenta Cliente -- evita ter duas telas de login diferentes pro
// mesmo produto.
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
  if (usuario) {
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

  const cliente = await prisma.cliente.findUnique({ where: { email } });
  if (cliente && cliente.senhaHash) {
    if (!cliente.ativo) {
      return { error: "Esta conta está inativa. Fale com a equipe." };
    }

    const senhaValida = await bcrypt.compare(senha, cliente.senhaHash);
    if (!senhaValida) {
      return { error: "E-mail ou senha inválidos." };
    }

    await createClienteSession({
      clienteId: cliente.id,
      email,
      nome: cliente.nome,
      empresaId: cliente.empresaId,
    });

    redirect("/cliente/plano");
  }

  return { error: "E-mail ou senha inválidos." };
}
