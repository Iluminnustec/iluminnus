import { prisma } from "@/lib/prisma";
import { AssinarForm } from "./assinar-form";

export default async function AssinarPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; origem?: string }>;
}) {
  const { ref, origem } = await searchParams;

  const indicador = ref
    ? await prisma.indicador.findUnique({ where: { codigo: ref.toUpperCase() } })
    : null;

  return (
    <AssinarForm
      codigoRef={ref}
      indicadorNome={indicador?.ativo ? indicador.nome : null}
      origem={origem}
    />
  );
}
