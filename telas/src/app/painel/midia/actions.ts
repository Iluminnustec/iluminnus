"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registrarLog } from "@/lib/log";
import { criarUploadAssinado, deletarMidiaArquivo } from "@/lib/storage";
import { getSessaoComEmpresa } from "@/lib/auth";

const TIPOS_IMAGEM = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const TIPOS_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const TAMANHO_MAXIMO = 500 * 1024 * 1024; // 500MB — sobe direto pro Supabase, sem limite da Vercel

export type MidiaState = { error?: string };

export type IniciarUploadResult =
  | { error: string }
  | { caminhoStorage: string; token: string; url: string; tipo: "IMAGEM" | "VIDEO" };

// Passo 1: valida o arquivo e devolve uma autorizacao de upload (token assinado)
// pro navegador enviar o arquivo DIRETO pro Supabase Storage — sem passar pelo
// corpo da requisicao da Vercel, que tem limite de ~4.5MB.
export async function iniciarUploadMidia(
  nomeArquivo: string,
  contentType: string,
  tamanho: number
): Promise<IniciarUploadResult> {
  let tipo: "IMAGEM" | "VIDEO";
  if (TIPOS_IMAGEM.includes(contentType)) tipo = "IMAGEM";
  else if (TIPOS_VIDEO.includes(contentType)) tipo = "VIDEO";
  else return { error: "Formato não suportado. Use PNG, JPG, WEBP, GIF, MP4, WEBM ou MOV." };

  if (tamanho > TAMANHO_MAXIMO) {
    return { error: "Arquivo muito grande (máximo 500MB)." };
  }

  try {
    const autorizado = await criarUploadAssinado(nomeArquivo);
    return { ...autorizado, tipo };
  } catch {
    return { error: "Falha ao autorizar o upload. Tente novamente." };
  }
}

const confirmarSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(["IMAGEM", "VIDEO"]),
  url: z.string().min(1),
  caminhoStorage: z.string().min(1),
  duracaoSegundos: z.coerce.number().int().min(1).default(10),
  clienteId: z.string().optional(),
  telaIds: z.array(z.string()).optional().default([]),
});

// Passo 2: depois que o navegador ja subiu o arquivo com sucesso, so cria o
// registro no banco (payload pequeno, sem os bytes do arquivo).
export async function confirmarMidia(input: unknown): Promise<MidiaState> {
  const session = await getSessaoComEmpresa();

  let data;
  try {
    data = confirmarSchema.parse(input);
  } catch {
    return { error: "Dados inválidos ao confirmar o upload." };
  }

  const [ultima, telasValidas] = await Promise.all([
    prisma.midia.findFirst({
      where: { empresaId: session.empresaId },
      orderBy: { ordem: "desc" },
    }),
    data.telaIds.length > 0
      ? prisma.tela.findMany({
          where: { id: { in: data.telaIds }, empresaId: session.empresaId },
          select: { id: true },
        })
      : Promise.resolve([]),
  ]);

  const midia = await prisma.midia.create({
    data: {
      empresaId: session.empresaId,
      nome: data.nome,
      tipo: data.tipo,
      url: data.url,
      caminhoStorage: data.caminhoStorage,
      duracaoSegundos: data.duracaoSegundos,
      ordem: (ultima?.ordem ?? -1) + 1,
      clienteId: data.clienteId || null,
      telas: telasValidas.length > 0 ? { connect: telasValidas.map((t) => ({ id: t.id })) } : undefined,
    },
  });

  await registrarLog({
    acao: "Adicionou mídia",
    entidade: "Midia",
    entidadeId: midia.id,
    descricao: `Adicionou "${midia.nome}" (${data.tipo.toLowerCase()}) em ${
      data.telaIds.length > 0 ? `${data.telaIds.length} tela(s) específica(s)` : "todas as telas (institucional)"
    }.`,
  });

  revalidatePath("/painel/midia");
  return {};
}

const updateSchema = z.object({
  duracaoSegundos: z.coerce.number().int().min(1),
  ativo: z.coerce.boolean().optional().default(false),
  clienteId: z.string().optional(),
});

export async function updateMidia(id: string, formData: FormData) {
  const session = await getSessaoComEmpresa();

  const raw = Object.fromEntries(formData.entries());
  raw.ativo = raw.ativo === "on" ? "true" : "";
  const data = updateSchema.parse(raw);
  const telaIds = formData.getAll("telaIds").map(String);

  const telasValidas =
    telaIds.length > 0
      ? await prisma.tela.findMany({
          where: { id: { in: telaIds }, empresaId: session.empresaId },
          select: { id: true },
        })
      : [];

  const midia = await prisma.midia.update({
    where: { id, empresaId: session.empresaId },
    data: {
      duracaoSegundos: data.duracaoSegundos,
      ativo: data.ativo,
      clienteId: data.clienteId || null,
      telas: { set: telasValidas.map((t) => ({ id: t.id })) },
    },
  });

  await registrarLog({
    acao: "Editou mídia",
    entidade: "Midia",
    entidadeId: midia.id,
    descricao: `Editou "${midia.nome}" (duração ${data.duracaoSegundos}s, ${data.ativo ? "ativa" : "inativa"}, ${
      telaIds.length > 0 ? `${telaIds.length} tela(s) específica(s)` : "todas as telas"
    }).`,
  });

  revalidatePath("/painel/midia");
}

export async function deleteMidia(id: string) {
  const session = await getSessaoComEmpresa();
  const midia = await prisma.midia.delete({ where: { id, empresaId: session.empresaId } });
  await deletarMidiaArquivo(midia.caminhoStorage);

  await registrarLog({
    acao: "Excluiu mídia",
    entidade: "Midia",
    entidadeId: id,
    descricao: `Excluiu "${midia.nome}" da playlist.`,
  });

  revalidatePath("/painel/midia");
}

export async function moverMidia(id: string, direcao: "up" | "down") {
  const session = await getSessaoComEmpresa();
  const midia = await prisma.midia.findUnique({ where: { id, empresaId: session.empresaId } });
  if (!midia) return;

  const vizinho = await prisma.midia.findFirst({
    where: {
      empresaId: session.empresaId,
      ordem: direcao === "up" ? { lt: midia.ordem } : { gt: midia.ordem },
    },
    orderBy: { ordem: direcao === "up" ? "desc" : "asc" },
  });
  if (!vizinho) return;

  await prisma.$transaction([
    prisma.midia.update({ where: { id: midia.id }, data: { ordem: vizinho.ordem } }),
    prisma.midia.update({ where: { id: vizinho.id }, data: { ordem: midia.ordem } }),
  ]);

  revalidatePath("/painel/midia");
}
