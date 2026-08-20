import { CadastroForm } from "./cadastro-form";

export default async function CadastroClientePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <CadastroForm codigoRef={ref} />;
}
