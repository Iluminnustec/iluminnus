"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";

const despesaSchema = z.object({
  descricao: z.string().min(1, "Informe a descrição."),
  categoria: z.enum([
    "EQUIPAMENTO",
    "ESTOQUE",
    "INSTALACAO",
    "MANUTENCAO",
    "MARKETING",
    "ADMINISTRATIVO",
    "COMISSAO",
    "OUTROS",
  ]),
  fornecedor: z.string().optional(),
  valorTotal: z.coerce.number().positive("Informe um valor válido."),
  dataCompra: z.coerce.date({ error: "Informe a data da compra." }),
  formaPagamento: z.enum([
    "A_VISTA",
    "CARTAO_CREDITO",
    "PIX",
    "BOLETO",
    "TRANSFERENCIA",
  ]),
  numeroParcelas: z.coerce.number().int().min(1).max(48),
  faturarMesSeguinte: z.coerce.boolean().optional().default(false),
  observacoes: z.string().optional(),
  pagoPorSocioId: z.string().optional(),
});

export type DespesaState = { error?: string };

function parseDespesaForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  raw.faturarMesSeguinte = raw.faturarMesSeguinte === "SEGUINTE" ? "true" : "";
  return despesaSchema.parse(raw);
}

function gerarParcelas(
  valorTotal: number,
  numeroParcelas: number,
  dataCompra: Date,
  faturarMesSeguinte: boolean
) {
  const offsetInicial = faturarMesSeguinte ? 1 : 0;
  const valorBase = Math.floor((valorTotal / numeroParcelas) * 100) / 100;
  const parcelas = [];
  let somaParcelas = 0;

  for (let i = 1; i <= numeroParcelas; i++) {
    const vencimento = new Date(dataCompra);
    vencimento.setUTCMonth(vencimento.getUTCMonth() + offsetInicial + (i - 1));

    const valor =
      i === numeroParcelas
        ? Math.round((valorTotal - somaParcelas) * 100) / 100
        : valorBase;
    somaParcelas += valor;

    parcelas.push({ numero: i, valor, vencimento });
  }

  return parcelas;
}

export async function createDespesa(
  _prevState: DespesaState,
  formData: FormData
): Promise<DespesaState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseDespesaForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const parcelas = gerarParcelas(
    data.valorTotal,
    data.numeroParcelas,
    data.dataCompra,
    data.faturarMesSeguinte
  );
  const avista = data.formaPagamento === "A_VISTA";

  const despesa = await prisma.despesa.create({
    data: {
      ...data,
      empresaId: session.empresaId,
      pagoPorSocioId: data.pagoPorSocioId || null,
      parcelas: {
        create: parcelas.map((p) => ({
          ...p,
          status: avista ? "PAGO" : "PENDENTE",
          dataPagamento: avista ? data.dataCompra : null,
        })),
      },
    },
  });
  await registrarLog({
    acao: "Criou despesa",
    entidade: "Despesa",
    entidadeId: despesa.id,
    descricao: `Criou a despesa "${despesa.descricao}" (${parcelas.length}x)${data.pagoPorSocioId ? " — adiantada por sócio" : ""}.`,
  });

  revalidatePath("/painel/despesas");
  redirect("/painel/despesas");
}

export async function updateDespesa(
  id: string,
  _prevState: DespesaState,
  formData: FormData
): Promise<DespesaState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseDespesaForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const atual = await prisma.despesa.findUnique({ where: { id, empresaId: session.empresaId } });
  if (!atual) {
    return { error: "Despesa não encontrada." };
  }

  const mudouFinanceiro =
    atual.valorTotal !== data.valorTotal ||
    atual.dataCompra.getTime() !== data.dataCompra.getTime() ||
    atual.formaPagamento !== data.formaPagamento ||
    atual.numeroParcelas !== data.numeroParcelas ||
    atual.faturarMesSeguinte !== data.faturarMesSeguinte;

  if (!mudouFinanceiro) {
    await prisma.despesa.update({
      where: { id },
      data: {
        descricao: data.descricao,
        categoria: data.categoria,
        fornecedor: data.fornecedor,
        observacoes: data.observacoes,
        pagoPorSocioId: data.pagoPorSocioId || null,
      },
    });
  } else {
    const parcelas = gerarParcelas(
      data.valorTotal,
      data.numeroParcelas,
      data.dataCompra,
      data.faturarMesSeguinte
    );
    const avista = data.formaPagamento === "A_VISTA";

    await prisma.$transaction([
      prisma.despesaParcela.deleteMany({ where: { despesaId: id } }),
      prisma.despesa.update({
        where: { id },
        data: {
          ...data,
          pagoPorSocioId: data.pagoPorSocioId || null,
          parcelas: {
            create: parcelas.map((p) => ({
              ...p,
              status: avista ? "PAGO" : "PENDENTE",
              dataPagamento: avista ? data.dataCompra : null,
            })),
          },
        },
      }),
    ]);
  }

  await registrarLog({
    acao: "Editou despesa",
    entidade: "Despesa",
    entidadeId: id,
    descricao: `Editou a despesa "${data.descricao}"${mudouFinanceiro ? " (parcelas recriadas)" : ""}.`,
  });

  revalidatePath("/painel/despesas");
  redirect("/painel/despesas");
}

export async function deleteDespesa(id: string) {
  const session = await getSessaoComEmpresa();
  // as parcelas sao apagadas automaticamente (onDelete: Cascade no schema)
  const despesa = await prisma.despesa.delete({ where: { id, empresaId: session.empresaId } });
  await registrarLog({
    acao: "Excluiu despesa",
    entidade: "Despesa",
    entidadeId: id,
    descricao: `Excluiu a despesa "${despesa.descricao}" (${despesa.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}).`,
  });
  revalidatePath("/painel/despesas");
  redirect("/painel/despesas");
}

export async function marcarReembolsado(id: string) {
  const session = await getSessaoComEmpresa();
  const despesa = await prisma.despesa.update({
    where: { id, empresaId: session.empresaId },
    data: { reembolsado: true, dataReembolso: new Date() },
    include: { pagoPorSocio: true },
  });

  await registrarLog({
    acao: "Marcou reembolso de despesa",
    entidade: "Despesa",
    entidadeId: despesa.id,
    descricao: `Marcou "${despesa.descricao}" como reembolsada para ${despesa.pagoPorSocio?.nome ?? "sócio"}.`,
  });

  revalidatePath("/painel/despesas");
}

export async function marcarParcelaPaga(id: string) {
  const session = await getSessaoComEmpresa();
  const parcelaExistente = await prisma.despesaParcela.findFirst({
    where: { id, despesa: { empresaId: session.empresaId } },
    select: { id: true },
  });
  if (!parcelaExistente) return;

  const parcela = await prisma.despesaParcela.update({
    where: { id },
    data: { status: "PAGO", dataPagamento: new Date() },
    include: { despesa: true },
  });
  await registrarLog({
    acao: "Marcou parcela como paga",
    entidade: "Despesa",
    entidadeId: parcela.despesaId,
    descricao: `Marcou a parcela ${parcela.numero} de "${parcela.despesa.descricao}" como paga.`,
  });
  revalidatePath("/painel/despesas");
}
