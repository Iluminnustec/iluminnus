import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditarUsuarioForm } from "./editar-form";
import { getSessaoComEmpresa } from "@/lib/auth";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessaoComEmpresa();
  const usuario = await prisma.usuario.findUnique({
    where: { id, empresaId: session.empresaId },
  });
  if (!usuario) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Editar usuário</h1>
      <EditarUsuarioForm usuario={usuario} />
    </div>
  );
}
