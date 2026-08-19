"use server";

import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth";
import { registrarLog } from "@/lib/log";

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    await registrarLog({
      acao: "Logout",
      entidade: "Usuario",
      entidadeId: session.userId,
      descricao: `${session.nome} saiu do painel.`,
    });
  }
  await destroySession();
  redirect("/login");
}
