import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Resolve qual Empresa (dono) corresponde à visita atual, a partir do
// domínio da requisição -- é assim que o site público e a área do cliente
// sabem de qual dono são a marca/conteúdo antes mesmo de qualquer login.
// Sem domínio configurado ainda (dev local, ou Empresa recém-criada antes
// de apontar o DNS), cai na primeira empresa ativa como fallback.
export async function getEmpresaAtual() {
  const headerList = await headers();
  const host = headerList.get("host")?.split(":")[0]?.toLowerCase();

  if (host) {
    const empresa = await prisma.empresa.findUnique({ where: { dominio: host } });
    if (empresa) return empresa;
  }

  return prisma.empresa.findFirst({
    where: { ativo: true },
    orderBy: { createdAt: "asc" },
  });
}
