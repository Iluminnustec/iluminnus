"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

const despesaSchema = z.object({
  descricao: z.string().min(1, "Informe a descrição."),
  categoria: z.string().optional(),
  valor: z.coerce.number().positive("Informe um valor válido."),
  data: z.coerce.date({ error: "Informe a data." }),
  observacoes: z.string().optional(),
});

export async function criarDespesaIluminnus(formData: FormData): Promise<void> {
  await exigirSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  const data = despesaSchema.parse(raw);

  await prisma.despesaIluminnus.create({ data });

  revalidatePath("/admin/financeiro");
  redirect("/admin/financeiro");
}

export async function marcarDespesaIluminnusPaga(id: string) {
  await exigirSuperAdmin();
  await prisma.despesaIluminnus.update({
    where: { id },
    data: { status: "PAGO", dataPagamento: new Date() },
  });
  revalidatePath("/admin/financeiro");
}

export async function excluirDespesaIluminnus(id: string) {
  await exigirSuperAdmin();
  await prisma.despesaIluminnus.delete({ where: { id } });
  revalidatePath("/admin/financeiro");
}
