"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function exigirSuperAdmin() {
  const session = await getSession();
  if (!session || session.cargo !== "SUPER_ADMIN") {
    throw new Error("Apenas administradores da Iluminnus podem acessar isto.");
  }
  return session;
}

const MAPA_ACENTOS: Record<string, string> = {
  á: "a", à: "a", â: "a", ã: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", õ: "o", ö: "o",
  ú: "u", ù: "u", û: "u", ü: "u",
  ç: "c", ñ: "n",
};

function slugify(valor: string) {
  return valor
    .toLowerCase()
    .split("")
    .map((c) => MAPA_ACENTOS[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function proximoVencimentoApartirDe(base: Date, diaVencimento: number) {
  const data = new Date(base.getFullYear(), base.getMonth() + 1, diaVencimento);
  return data;
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
  const proximoVencimento = proximoVencimentoApartirDe(new Date(), data.diaVencimento);

  await prisma.$transaction(async (tx) => {
    const empresa = await tx.empresa.create({
      data: {
        nome: data.nome,
        slug,
        dominio: data.dominio || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
      },
    });

    await tx.assinatura.create({
      data: {
        empresaId: empresa.id,
        plano: data.plano,
        valorMensal: data.valorMensal,
        diaVencimento: data.diaVencimento,
        status: "ATIVA",
        proximoVencimento,
      },
    });

    await tx.usuario.create({
      data: {
        nome: data.adminNome,
        email: data.adminEmail,
        senhaHash,
        cargo: "ADMIN",
        empresaId: empresa.id,
      },
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
