import { prisma } from "@/lib/prisma";
import { AssinarForm } from "./assinar-form";

export default async function AssinarPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  const indicador = ref
    ? await prisma.indicador.findUnique({ where: { codigo: ref.toUpperCase() } })
    : null;

  return (
    <AssinarForm
      ref={ref}
      indicadorNome={indicador?.ativo ? indicador.nome : null}
    />
  );
}
