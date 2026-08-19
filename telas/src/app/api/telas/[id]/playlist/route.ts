import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tela = await prisma.tela.findUnique({
    where: { id },
    select: { id: true, nome: true, rotacao: true, empresaId: true },
  });

  if (!tela) {
    return NextResponse.json({ error: "Tela não encontrada." }, { status: 404 });
  }

  // Midia especifica dessa tela + midia institucional da mesma empresa (sem
  // nenhuma tela marcada) -- nunca mistura conteúdo entre donos diferentes.
  const itens = await prisma.midia.findMany({
    where: {
      ativo: true,
      empresaId: tela.empresaId,
      OR: [{ telas: { some: { id: tela.id } } }, { telas: { none: {} } }],
    },
    orderBy: { ordem: "asc" },
    select: { id: true, nome: true, tipo: true, url: true, duracaoSegundos: true, ordem: true },
  });

  return NextResponse.json(
    {
      tela: { id: tela.id, nome: tela.nome, rotacao: tela.rotacao },
      itens,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
