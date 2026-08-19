"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { getSessaoComEmpresa } from "@/lib/auth";

const itemSchema = z.object({
  nome: z.string().min(1, "Informe o nome do item."),
  categoria: z.string().optional(),
  quantidade: z.coerce.number().int().min(0),
  valorUnitario: z.coerce.number().min(0).optional(),
  fornecedor: z.string().optional(),
  dataEntrada: z.coerce.date({ error: "Informe a data de entrada." }),
  status: z.enum(["DISPONIVEL", "EM_USO", "MANUTENCAO", "BAIXADO"]),
  observacoes: z.string().optional(),
});

const itemUpdateSchema = itemSchema.omit({ quantidade: true });

export type ItemEstoqueState = { error?: string };

function parseItemUpdateForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  if (raw.valorUnitario === "") delete raw.valorUnitario;
  const parsed = itemUpdateSchema.parse(raw);
  return {
    ...parsed,
    valorUnitario: parsed.valorUnitario ?? null,
  };
}

const adicionarEstoqueSchema = z.object({
  itemId: z.string().optional(),
  nome: z.string().optional(),
  categoria: z.string().optional(),
  valorUnitario: z.coerce.number().min(0).optional(),
  fornecedor: z.string().optional(),
  status: z.enum(["DISPONIVEL", "EM_USO", "MANUTENCAO", "BAIXADO"]).optional(),
  quantidade: z.coerce.number().int().positive("Informe uma quantidade válida."),
  data: z.coerce.date({ error: "Informe a data." }),
  motivo: z.string().optional(),
  observacoes: z.string().optional(),
});

// Tela unica de "adicionar ao estoque": se o item ja existe (selecionado no
// dropdown), so registra uma entrada nele; se for "novo item", cria do zero.
// Evita item duplicado quando alguem digita o nome de um jeito ligeiramente
// diferente do que ja esta cadastrado.
export async function adicionarEstoque(
  _prevState: ItemEstoqueState,
  formData: FormData
): Promise<ItemEstoqueState> {
  const session = await getSessaoComEmpresa();

  const raw = Object.fromEntries(formData.entries());
  if (raw.valorUnitario === "") delete raw.valorUnitario;
  let data;
  try {
    data = adicionarEstoqueSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  if (data.itemId) {
    const item = await prisma.itemEstoque.findUnique({
      where: { id: data.itemId, empresaId: session.empresaId },
    });
    if (!item) return { error: "Item não encontrado." };

    await prisma.itemEstoque.update({
      where: { id: item.id },
      data: {
        quantidade: { increment: data.quantidade },
        movimentos: {
          create: [
            {
              tipo: "ENTRADA",
              quantidade: data.quantidade,
              data: data.data,
              motivo: data.motivo || "Reposição de estoque",
              observacoes: data.observacoes,
            },
          ],
        },
      },
    });

    await registrarLog({
      acao: "Registrou entrada de estoque",
      entidade: "ItemEstoque",
      entidadeId: item.id,
      descricao: `Entrada de ${data.quantidade} unidade(s) de "${item.nome}".`,
    });
  } else {
    if (!data.nome) return { error: "Informe o nome do item." };

    const item = await prisma.itemEstoque.create({
      data: {
        empresaId: session.empresaId,
        nome: data.nome,
        categoria: data.categoria,
        quantidade: data.quantidade,
        valorUnitario: data.valorUnitario ?? null,
        fornecedor: data.fornecedor,
        dataEntrada: data.data,
        status: data.status ?? "DISPONIVEL",
        observacoes: data.observacoes,
        movimentos: {
          create: [
            {
              tipo: "ENTRADA",
              quantidade: data.quantidade,
              data: data.data,
              motivo: "Cadastro inicial do item",
            },
          ],
        },
      },
    });

    await registrarLog({
      acao: "Criou item de estoque",
      entidade: "ItemEstoque",
      entidadeId: item.id,
      descricao: `Cadastrou "${item.nome}" com ${item.quantidade} unidade(s) em estoque.`,
    });
  }

  revalidatePath("/painel/estoque");
  redirect("/painel/estoque");
}

export async function updateItemEstoque(
  id: string,
  _prevState: ItemEstoqueState,
  formData: FormData
): Promise<ItemEstoqueState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = parseItemUpdateForm(formData);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const item = await prisma.itemEstoque.update({
    where: { id, empresaId: session.empresaId },
    data,
  });
  await registrarLog({
    acao: "Editou item de estoque",
    entidade: "ItemEstoque",
    entidadeId: item.id,
    descricao: `Editou "${item.nome}".`,
  });
  revalidatePath("/painel/estoque");
  redirect("/painel/estoque");
}

const instalarSchema = z.object({
  itemId: z.string().min(1),
  predioId: z.string().min(1, "Selecione o prédio."),
  nome: z.string().min(1, "Informe o nome da tela."),
  tipo: z.enum(["TV_ELEVADOR", "TOTEM_HALL", "TELA_HORIZONTAL", "OUTRO"]),
});

export type InstalarState = { error?: string };

export async function instalarItemNoPredio(
  _prevState: InstalarState,
  formData: FormData
): Promise<InstalarState> {
  const session = await getSessaoComEmpresa();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = instalarSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const [item, predio] = await Promise.all([
    prisma.itemEstoque.findUnique({ where: { id: data.itemId, empresaId: session.empresaId } }),
    prisma.predio.findUnique({ where: { id: data.predioId, empresaId: session.empresaId } }),
  ]);
  if (!item || item.quantidade < 1) {
    return { error: "Item sem quantidade disponível em estoque." };
  }
  if (!predio) {
    return { error: "Prédio não encontrado." };
  }

  await prisma.$transaction([
    prisma.tela.create({
      data: {
        empresaId: session.empresaId,
        nome: data.nome,
        predioId: data.predioId,
        tipo: data.tipo,
        especificacoes: item.categoria,
      },
    }),
    prisma.itemEstoque.update({
      where: { id: item.id },
      data: {
        quantidade: { decrement: 1 },
        status: item.quantidade - 1 <= 0 ? "EM_USO" : item.status,
        movimentos: {
          create: [
            {
              tipo: "SAIDA",
              quantidade: 1,
              motivo: `Instalado em ${predio.nome} (${data.nome})`,
            },
          ],
        },
      },
    }),
  ]);

  await registrarLog({
    acao: "Instalou tela",
    entidade: "ItemEstoque",
    entidadeId: item.id,
    descricao: `Instalou "${data.nome}" (de "${item.nome}") no prédio ${predio.nome}.`,
  });

  revalidatePath("/painel/estoque");
  revalidatePath("/painel/telas");
  revalidatePath("/painel/predios");
  redirect("/painel/estoque");
}

const movimentoSchema = z.object({
  itemId: z.string().min(1),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  quantidade: z.coerce.number().int().positive("Informe uma quantidade válida."),
  data: z.coerce.date({ error: "Informe a data." }),
  motivo: z.string().min(1, "Informe o motivo."),
  observacoes: z.string().optional(),
});

export type MovimentoState = { error?: string };

export async function registrarMovimento(
  _prevState: MovimentoState,
  formData: FormData
): Promise<MovimentoState> {
  const session = await getSessaoComEmpresa();

  const raw = Object.fromEntries(formData.entries());
  let data;
  try {
    data = movimentoSchema.parse(raw);
  } catch {
    return { error: "Verifique os campos obrigatórios." };
  }

  const item = await prisma.itemEstoque.findUnique({
    where: { id: data.itemId, empresaId: session.empresaId },
  });
  if (!item) {
    return { error: "Item não encontrado." };
  }
  if (data.tipo === "SAIDA" && data.quantidade > item.quantidade) {
    return { error: `Só há ${item.quantidade} unidade(s) disponível(is) para dar saída.` };
  }

  await prisma.itemEstoque.update({
    where: { id: item.id },
    data: {
      quantidade:
        data.tipo === "ENTRADA"
          ? { increment: data.quantidade }
          : { decrement: data.quantidade },
      movimentos: {
        create: [
          {
            tipo: data.tipo,
            quantidade: data.quantidade,
            data: data.data,
            motivo: data.motivo,
            observacoes: data.observacoes,
          },
        ],
      },
    },
  });

  await registrarLog({
    acao: data.tipo === "ENTRADA" ? "Registrou entrada de estoque" : "Registrou saída de estoque",
    entidade: "ItemEstoque",
    entidadeId: item.id,
    descricao: `${data.tipo === "ENTRADA" ? "Entrada" : "Saída"} de ${data.quantidade} unidade(s) de "${item.nome}" — ${data.motivo}.`,
  });

  revalidatePath("/painel/estoque");
  return {};
}
