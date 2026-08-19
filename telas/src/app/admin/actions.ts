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
  indicadorId: z.string().optional(),
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
      indicadorId: data.indicadorId || null,
    });
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateEmpresaIndicador(empresaId: string, indicadorId: string | null) {
  await exigirSuperAdmin();
  await prisma.empresa.update({ where: { id: empresaId }, data: { indicadorId } });
  revalidatePath(`/admin/empresas/${empresaId}`);
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

  const assinatura = await prisma.assinatura.findUnique({
    where: { id: assinaturaId },
    include: { empresa: { include: { indicador: true } } },
  });
  if (!assinatura) {
    return { error: "Assinatura não encontrada." };
  }

  const referencia = new Date(`${data.referencia}-01T00:00:00`);
  const proximoVencimento = proximoVencimentoApartirDe(referencia, assinatura.diaVencimento);
  const indicador = assinatura.empresa.indicador;

  await prisma.$transaction(async (tx) => {
    const pagamento = await tx.pagamentoAssinatura.create({
      data: {
        assinaturaId,
        valor: data.valor,
        referencia,
        observacoes: data.observacoes || null,
        registradoPor: session.nome,
      },
    });

    // Empresa veio de indicação: gera a comissão do indicador sobre esse
    // pagamento (recorrente, um por pagamento, enquanto a Empresa assinar).
    if (indicador && indicador.ativo) {
      const valorComissao = (data.valor * indicador.percentualPadrao) / 100;
      await tx.comissaoIndicacao.create({
        data: {
          indicadorId: indicador.id,
          empresaId: assinatura.empresaId,
          pagamentoAssinaturaId: pagamento.id,
          percentual: indicador.percentualPadrao,
          valorPago: data.valor,
          valorComissao,
        },
      });
    }

    // Um pagamento de verdade encerra o período de teste (se ainda houver
    // um em aberto) — a empresa vira assinante paga, não mostra mais
    // "em teste" no /admin.
    await tx.assinatura.update({
      where: { id: assinaturaId },
      data: { status: "ATIVA", proximoVencimento, trialAte: null },
    });
  });

  revalidatePath(`/admin/empresas/${empresaId}`);
  redirect(`/admin/empresas/${empresaId}`);
}

export type IndicadorState = { error?: string };

const indicadorSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  contato: z.string().optional(),
  chavePix: z.string().optional(),
  percentualPadrao: z.coerce.number().min(0).max(100),
});

export async function createIndicador(
  _prevState: IndicadorState,
  formData: FormData
): Promise<IndicadorState> {
  await exigirSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = indicadorSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  await prisma.indicador.create({
    data: {
      nome: data.nome,
      contato: data.contato || null,
      chavePix: data.chavePix || null,
      percentualPadrao: data.percentualPadrao,
    },
  });

  revalidatePath("/admin/indicadores");
  redirect("/admin/indicadores");
}

export async function updateIndicadorAtivo(id: string, ativo: boolean) {
  await exigirSuperAdmin();
  await prisma.indicador.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/indicadores");
  revalidatePath(`/admin/indicadores/${id}`);
}

export async function marcarComissaoPaga(id: string, indicadorId: string) {
  await exigirSuperAdmin();
  await prisma.comissaoIndicacao.update({
    where: { id },
    data: { status: "PAGA", dataPagamentoComissao: new Date() },
  });
  revalidatePath(`/admin/indicadores/${indicadorId}`);
}
