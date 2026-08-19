import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const checkinSchema = z.object({
  deviceId: z.string().min(1),
  appVersao: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido, esperado JSON." }, { status: 400 });
  }

  let data;
  try {
    data = checkinSchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Informe deviceId." }, { status: 400 });
  }

  const dispositivo = await prisma.dispositivo.upsert({
    where: { deviceId: data.deviceId },
    create: { deviceId: data.deviceId, appVersao: data.appVersao },
    update: { ultimoContato: new Date(), appVersao: data.appVersao },
    include: { tela: true },
  });

  if (!dispositivo.telaId || !dispositivo.tela) {
    return NextResponse.json({
      deviceId: dispositivo.deviceId,
      atribuido: false,
      apelido: dispositivo.apelido,
      itens: [],
    });
  }

  // Midia especifica dessa tela + midia institucional da mesma empresa (sem
  // nenhuma tela marcada) -- nunca mistura conteúdo entre donos diferentes.
  const itens = await prisma.midia.findMany({
    where: {
      ativo: true,
      empresaId: dispositivo.tela.empresaId,
      OR: [{ telas: { some: { id: dispositivo.tela.id } } }, { telas: { none: {} } }],
    },
    orderBy: { ordem: "asc" },
    select: { id: true, nome: true, tipo: true, url: true, duracaoSegundos: true, ordem: true },
  });

  return NextResponse.json(
    {
      deviceId: dispositivo.deviceId,
      atribuido: true,
      apelido: dispositivo.apelido,
      tela: {
        id: dispositivo.tela.id,
        nome: dispositivo.tela.nome,
        rotacao: dispositivo.tela.rotacao,
      },
      itens,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
