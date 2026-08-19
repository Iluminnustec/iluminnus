import { prisma } from "@/lib/prisma";
import { calcularPrecoTela, contarOcupacaoPorTela } from "@/lib/precificacao";
import { PlanoPicker } from "./plano-picker";
import { getClienteSession } from "@/lib/auth-cliente";

export default async function PlanoPage() {
  const session = await getClienteSession();
  const [telas, midiasAtivas] = await Promise.all([
    prisma.tela.findMany({
      where: { status: "ATIVA", empresaId: session!.empresaId },
      orderBy: [{ predio: { nome: "asc" } }, { nome: "asc" }],
      include: { predio: { select: { nome: true, bairro: true, cidade: true } } },
    }),
    prisma.midia.findMany({
      where: { ativo: true, clienteId: { not: null }, empresaId: session!.empresaId },
      select: { clienteId: true, telas: { select: { id: true } } },
    }),
  ]);

  const ocupacaoPorTela = contarOcupacaoPorTela(midiasAtivas);

  const opcoes = telas.map((tela) => {
    const ocupacao = ocupacaoPorTela.get(tela.id) ?? 0;
    const preco = calcularPrecoTela(tela.precoBase, ocupacao);
    return {
      id: tela.id,
      nome: tela.nome,
      predioNome: tela.predio.nome,
      predioLocal: [tela.predio.bairro, tela.predio.cidade].filter(Boolean).join(", "),
      ...preco,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Monte seu plano</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Escolha as telas onde sua marca vai aparecer. O preço de cada tela varia
        com a demanda — quanto mais próxima de lotar, maior o valor. Ao enviar,
        nosso time analisa e entra em contato pra fechar o contrato.
      </p>
      <PlanoPicker opcoes={opcoes} />
    </div>
  );
}
