"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";
import { calcularComissaoMensal, inicioDoMes, formatarMesReferencia } from "@/lib/comissionamento";

const vendaSchema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente."),
  vendedorId: z.string().min(1, "Selecione o vendedor."),
  valorVenda: z.coerce.number().positive("Informe um valor válido."),
  dataPagamento: z.coerce.date({ error: "Informe a data do pagamento." }),
  observacoes: z.string().optional(),
});

export type VendaState = { error?: string };

export async function registrarVenda(
  _prevState: VendaState,
  formData: FormData
): Promise<VendaState> {
  const session = await getSessaoComEmpresa();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = vendaSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const [cliente, vendedor] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: data.clienteId, empresaId: session.empresaId } }),
    prisma.usuario.findUnique({ where: { id: data.vendedorId, empresaId: session.empresaId } }),
  ]);
  if (!cliente) return { error: "Cliente não encontrado." };
  if (!vendedor) return { error: "Vendedor não encontrado." };

  const venda = await prisma.venda.create({ data: { ...data, empresaId: session.empresaId } });

  await registrarLog({
    acao: "Registrou venda",
    entidade: "Venda",
    entidadeId: venda.id,
    descricao: `Registrou venda de ${vendedor.nome} — cliente "${cliente.nome}" — ${data.valorVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
  });

  revalidatePath("/painel/comissoes");
  return {};
}

export async function excluirVenda(id: string) {
  const session = await getSessaoComEmpresa();
  const venda = await prisma.venda.findUnique({
    where: { id, empresaId: session.empresaId },
    include: { cliente: true, vendedor: true },
  });
  if (!venda) return;

  await prisma.venda.delete({ where: { id } });

  await registrarLog({
    acao: "Excluiu venda",
    entidade: "Venda",
    entidadeId: id,
    descricao: `Excluiu a venda de ${venda.vendedor.nome} — cliente "${venda.cliente.nome}".`,
  });

  revalidatePath("/painel/comissoes");
}

export async function fecharComissaoDoMes(vendedorId: string, mesReferenciaISO: string) {
  const session = await getSessaoComEmpresa();
  const mesReferencia = inicioDoMes(new Date(mesReferenciaISO));
  const proximoMes = new Date(
    Date.UTC(mesReferencia.getUTCFullYear(), mesReferencia.getUTCMonth() + 1, 1)
  );

  const existente = await prisma.fechamentoComissao.findUnique({
    where: { vendedorId_mesReferencia: { vendedorId, mesReferencia }, empresaId: session.empresaId },
  });
  if (existente) return;

  const [vendedor, vendas] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: vendedorId, empresaId: session.empresaId } }),
    prisma.venda.findMany({
      where: {
        vendedorId,
        empresaId: session.empresaId,
        dataPagamento: { gte: mesReferencia, lt: proximoMes },
      },
    }),
  ]);
  if (!vendedor) return;

  const totalVendido = vendas.reduce((soma, v) => soma + v.valorVenda, 0);
  const { percentual, valorComissao } = calcularComissaoMensal(totalVendido);

  const mesLabel = formatarMesReferencia(mesReferencia);

  const despesa = await prisma.despesa.create({
    data: {
      empresaId: session.empresaId,
      descricao: `Comissão — ${vendedor.nome} (${mesLabel})`,
      categoria: "COMISSAO",
      valorTotal: valorComissao,
      dataCompra: proximoMes,
      formaPagamento: "PIX",
      numeroParcelas: 1,
      parcelas: {
        create: [{ numero: 1, valor: valorComissao, vencimento: proximoMes, status: "PENDENTE" }],
      },
    },
  });

  const fechamento = await prisma.fechamentoComissao.create({
    data: {
      empresaId: session.empresaId,
      vendedorId,
      mesReferencia,
      totalVendido,
      percentual,
      valorComissao,
      despesaId: despesa.id,
    },
  });

  await registrarLog({
    acao: "Fechou comissão do mês",
    entidade: "FechamentoComissao",
    entidadeId: fechamento.id,
    descricao: `Fechou a comissão de ${vendedor.nome} em ${mesLabel}: ${totalVendido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} vendidos, ${percentual}% = ${valorComissao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
  });

  revalidatePath("/painel/comissoes");
  revalidatePath("/painel/despesas");
  revalidatePath("/painel");
}

export async function excluirFechamento(id: string) {
  const session = await getSessaoComEmpresa();
  const fechamento = await prisma.fechamentoComissao.findUnique({
    where: { id, empresaId: session.empresaId },
    include: { vendedor: true },
  });
  if (!fechamento) return;

  // apaga a despesa vinculada, que arrasta o fechamento junto (onDelete: Cascade)
  await prisma.despesa.delete({ where: { id: fechamento.despesaId } });

  await registrarLog({
    acao: "Reabriu fechamento de comissão",
    entidade: "FechamentoComissao",
    entidadeId: id,
    descricao: `Desfez o fechamento de comissão de ${fechamento.vendedor.nome} em ${formatarMesReferencia(fechamento.mesReferencia)}.`,
  });

  revalidatePath("/painel/comissoes");
  revalidatePath("/painel/despesas");
  revalidatePath("/painel");
}

// Mantido apenas para permitir excluir comissoes antigas (modelo anterior,
// por venda individual com percentual manual) que ainda aparecem no historico.
export async function excluirComissao(id: string) {
  const session = await getSessaoComEmpresa();
  const comissao = await prisma.comissao.findUnique({
    where: { id, empresaId: session.empresaId },
    include: { cliente: true, vendedor: true },
  });
  if (!comissao) return;

  await prisma.despesa.delete({ where: { id: comissao.despesaId } });

  await registrarLog({
    acao: "Excluiu comissão (modelo antigo)",
    entidade: "Comissao",
    entidadeId: id,
    descricao: `Excluiu a comissão antiga de ${comissao.vendedor.nome} pela venda de "${comissao.cliente.nome}".`,
  });

  revalidatePath("/painel/comissoes");
  revalidatePath("/painel/despesas");
  revalidatePath("/painel");
}
