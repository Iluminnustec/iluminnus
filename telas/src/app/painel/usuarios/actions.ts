"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessaoComEmpresa } from "@/lib/auth";
import { registrarLog } from "@/lib/log";
import { gerarCodigoReferral } from "@/lib/referral";

async function exigirAdmin() {
  const session = await getSessaoComEmpresa();
  if (session.cargo !== "ADMIN") {
    throw new Error("Apenas administradores podem gerenciar usuários.");
  }
  return session;
}

async function gerarCodigoReferralUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigoReferral();
    const existente = await prisma.usuario.findUnique({ where: { codigoReferral: codigo } });
    if (!existente) return codigo;
  }
  throw new Error("Não foi possível gerar um código de indicação único.");
}

const usuarioSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
  cargo: z.enum(["ADMIN", "SUPERVISOR", "VENDAS", "SOCIO"]),
  senha: z.string().optional(),
});

export type UsuarioState = { error?: string };

export async function createUsuario(
  _prevState: UsuarioState,
  formData: FormData
): Promise<UsuarioState> {
  const session = await exigirAdmin();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = usuarioSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  if (!data.senha || data.senha.length < 8) {
    return { error: "A senha inicial precisa ter pelo menos 8 caracteres." };
  }

  const existente = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existente) {
    return { error: "Já existe um usuário com esse e-mail." };
  }

  const senhaHash = await bcrypt.hash(data.senha, 10);
  const codigoReferral = await gerarCodigoReferralUnico();
  const novo = await prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      cargo: data.cargo,
      senhaHash,
      empresaId: session.empresaId,
      codigoReferral,
    },
  });

  await registrarLog({
    acao: "Criou usuário",
    entidade: "Usuario",
    entidadeId: novo.id,
    descricao: `Criou o usuário ${novo.nome} (${novo.email}) como ${novo.cargo}.`,
  });

  revalidatePath("/painel/usuarios");
  redirect("/painel/usuarios");
}

const usuarioUpdateSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
  cargo: z.enum(["ADMIN", "SUPERVISOR", "VENDAS", "SOCIO"]),
  novaSenha: z.string().optional(),
  ativo: z.coerce.boolean().optional().default(false),
});

export async function updateUsuario(
  id: string,
  _prevState: UsuarioState,
  formData: FormData
): Promise<UsuarioState> {
  const session = await exigirAdmin();

  const raw = Object.fromEntries(formData.entries());
  raw.ativo = raw.ativo === "on" ? "true" : "";
  let data;
  try {
    data = usuarioUpdateSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  if (data.novaSenha && data.novaSenha.length < 8) {
    return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  }

  const atualizacao: {
    nome: string;
    email: string;
    cargo: typeof data.cargo;
    ativo: boolean;
    senhaHash?: string;
  } = {
    nome: data.nome,
    email: data.email,
    cargo: data.cargo,
    ativo: data.ativo,
  };

  if (data.novaSenha) {
    atualizacao.senhaHash = await bcrypt.hash(data.novaSenha, 10);
  }

  const atualizado = await prisma.usuario.update({
    where: { id, empresaId: session.empresaId },
    data: atualizacao,
  });

  await registrarLog({
    acao: "Editou usuário",
    entidade: "Usuario",
    entidadeId: atualizado.id,
    descricao: `Editou o usuário ${atualizado.nome} (${atualizado.email}) — cargo: ${atualizado.cargo}, ativo: ${atualizado.ativo ? "sim" : "não"}.`,
  });

  revalidatePath("/painel/usuarios");
  redirect("/painel/usuarios");
}
