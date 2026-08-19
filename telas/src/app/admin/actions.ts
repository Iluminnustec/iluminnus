"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify, proximoVencimentoApartirDe, provisionarEmpresa } from "@/lib/provisionamento";

async function exigirSuperAdmin() {
  const session = await getSession();
  if (!session || session.cargo !== "SUPER_ADMIN") {
    throw new Error("Apenas administradores da Iluminnus podem acessar isto.");
  }
  return session;
}

export type EmpresaState = { error?: string };

const empresaSchema = z.object({
  nome: z.string().min(1, "Informe o nome do dono."),
  dominio: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  plano: z.string().min(1, "Informe o plano."),
  valorMensal: z.coerce.number().min(0, "Valor inválido."),
  diaVencimento: z.coerce.number().int().min(1).max(28),
  adminNome: z.string().min(1, "Informe o nome do responsável."),
  adminEmail: z.string().email("E-mail inválido."),
  adminSenha: z.string().min(8, "A senha inicial precisa ter pelo menos 8 caracteres."),
});

export async function createEmpresa(
  _prevState: EmpresaState,
  formData: FormData
): Promise<EmpresaState> {
  await exigirSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = empresaSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const slug = slugify(data.nome);
  const [empresaExistente, emailExistente] = await Promise.all([
    prisma.empresa.findUnique({ where: { slug } }),
    prisma.usuario.findUnique({ where: { email: data.adminEmail } }),
  ]);
  if (empresaExistente) {
    return { error: "Já existe uma empresa com um nome muito parecido (slug duplicado)." };
  }
  if (emailExistente) {
    return { error: "Já existe um usuário com esse e-mail." };
  }

  const senhaHash = await bcrypt.hash(data.adminSenha, 10);

  await prisma.$transaction(async (tx) => {
    await provisionarEmpresa(tx, {
      nome: data.nome,
      dominio: data.dominio,
      cidade: data.cidade,
      estado: data.estado,
      plano: data.plano,
      valorMensal: data.valorMensal,
      diaVencimento: data.diaVencimento,
      adminNome: data.adminNome,
      adminEmail: data.adminEmail,
      adminSenhaHash: senhaHash,
    });
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateEmpresaAtivo(id: string, ativo: boolean) {
  await exigirSuperAdmin();
  await prisma.empresa.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin");
  revalidatePath(`/admin/empresas/${id}`);
}

export type AssinaturaState = { error?: string };

const assinaturaSchema = z.object({
  plano: z.string().min(1, "Informe o plano."),
  valorMensal: z.coerce.number().min(0, "Valor inválido."),
  diaVencimento: z.coerce.number().int().min(1).max(28),
  status: z.enum(["ATIVA", "ATRASADA", "SUSPENSA", "CANCELADA"]),
});

export async function updateAssinatura(
  assinaturaId: string,
  empresaId: string,
  _prevState: AssinaturaState,
  formData: FormData
): Promise<AssinaturaState> {
  await exigirSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = assinaturaSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  await prisma.assinatura.update({
    where: { id: assinaturaId },
    data,
  });

  revalidatePath(`/admin/empresas/${empresaId}`);
  redirect(`/admin/empresas/${empresaId}`);
}

export type PagamentoState = { error?: string };

const pagamentoSchema = z.object({
  valor: z.coerce.number().min(0.01, "Informe o valor pago."),
  referencia: z.string().min(1, "Informe o mês de referência."),
  observacoes: z.string().optional(),
});

export async function registrarPagamento(
  assinaturaId: string,
  empresaId: string,
  _prevState: PagamentoState,
  formData: FormData
): Promise<PagamentoState> {
  const session = await exigirSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = pagamentoSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const assinatura = await prisma.assinatura.findUnique({ where: { id: assinaturaId } });
  if (!assinatura) {
    return { error: "Assinatura não encontrada." };
  }

  const referencia = new Date(`${data.referencia}-01T00:00:00`);
  const proximoVencimento = proximoVencimentoApartirDe(referencia, assinatura.diaVencimento);

  await prisma.$transaction([
    prisma.pagamentoAssinatura.create({
      data: {
        assinaturaId,
        valor: data.valor,
        referencia,
        observacoes: data.observacoes || null,
        registradoPor: session.nome,
      },
    }),
    prisma.assinatura.update({
      where: { id: assinaturaId },
      data: { status: "ATIVA", proximoVencimento },
    }),
  ]);

  revalidatePath(`/admin/empresas/${empresaId}`);
  redirect(`/admin/empresas/${empresaId}`);
}
