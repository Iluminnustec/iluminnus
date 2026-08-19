"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, rotaInicial } from "@/lib/auth";
import { provisionarEmpresa, slugify } from "@/lib/provisionamento";
import { registrarLog } from "@/lib/log";

export type AssinarState = { error?: string };

const TRIAL_DIAS = 14;

const assinarSchema = z.object({
  empresaNome: z.string().min(1, "Informe o nome da sua empresa."),
  cidade: z.string().optional(),
  adminNome: z.string().min(1, "Informe seu nome."),
  adminEmail: z.string().email("E-mail inválido."),
  adminSenha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export async function criarContaTelas(
  _prevState: AssinarState,
  formData: FormData
): Promise<AssinarState> {
  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = assinarSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios (senha com pelo menos 8 caracteres)." };
  }

  const slug = slugify(data.empresaNome);
  const [emailExistente, empresaExistente] = await Promise.all([
    prisma.usuario.findUnique({ where: { email: data.adminEmail } }),
    prisma.empresa.findUnique({ where: { slug } }),
  ]);
  if (emailExistente) {
    return { error: "Já existe uma conta com esse e-mail. Faça login." };
  }
  if (empresaExistente) {
    return { error: "Já existe uma empresa cadastrada com esse nome. Fale com a gente." };
  }

  const senhaHash = await bcrypt.hash(data.adminSenha, 10);
  const trialAte = new Date();
  trialAte.setDate(trialAte.getDate() + TRIAL_DIAS);

  const { usuario, empresa } = await prisma.$transaction(async (tx) => {
    return provisionarEmpresa(tx, {
      nome: data.empresaNome,
      cidade: data.cidade,
      plano: "Trial",
      valorMensal: 0,
      diaVencimento: 5,
      status: "ATIVA",
      trialAte,
      adminNome: data.adminNome,
      adminEmail: data.adminEmail,
      adminSenhaHash: senhaHash,
    });
  });

  await createSession({
    userId: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    cargo: usuario.cargo,
    empresaId: usuario.empresaId,
  });

  await registrarLog({
    acao: "Assinou o Telas (auto-cadastro)",
    entidade: "Empresa",
    entidadeId: empresa.id,
    descricao: `${data.adminNome} criou a conta de "${empresa.nome}" com teste grátis de ${TRIAL_DIAS} dias.`,
  });

  redirect(rotaInicial(usuario.cargo));
}
