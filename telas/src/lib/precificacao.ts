// Cada cliente ocupa 1 "vaga" numa tela (tem direito a 2 videos de 15s ou
// 3 midias estaticas de 10s em rotacao). 30 vagas e o teto pratico por tela.
export const CAPACIDADE_MAXIMA_TELA = 30;

export const FAIXAS_OCUPACAO = [
  { max: 10, multiplicador: 1, label: "Disponível", badge: "bg-slate-100 text-slate-600" },
  { max: 20, multiplicador: 1.35, label: "Em alta", badge: "bg-blue-100 text-blue-700" },
  { max: 27, multiplicador: 1.75, label: "Quase lotada", badge: "bg-amber-100 text-amber-700" },
  { max: 30, multiplicador: 2.25, label: "Última(s) vaga(s)", badge: "bg-red-100 text-red-700" },
] as const;

export function faixaPorOcupacao(ocupacao: number) {
  return (
    FAIXAS_OCUPACAO.find((faixa) => ocupacao <= faixa.max) ??
    FAIXAS_OCUPACAO[FAIXAS_OCUPACAO.length - 1]
  );
}

export function calcularPrecoTela(precoBase: number, ocupacao: number) {
  const faixa = faixaPorOcupacao(ocupacao);
  const precoAtual = Math.round(precoBase * faixa.multiplicador * 100) / 100;
  return {
    ...faixa,
    ocupacao,
    capacidade: CAPACIDADE_MAXIMA_TELA,
    vagasRestantes: Math.max(0, CAPACIDADE_MAXIMA_TELA - ocupacao),
    precoAtual,
  };
}

// Conta, por tela, quantos clientes distintos tem midia ativa mirando ela.
// Midia institucional (sem telas marcadas, toca em todas) nao conta como
// ocupacao de nenhuma tela especifica.
export function contarOcupacaoPorTela(
  midiasAtivas: { clienteId: string | null; telas: { id: string }[] }[]
): Map<string, number> {
  const clientesPorTela = new Map<string, Set<string>>();
  for (const midia of midiasAtivas) {
    if (!midia.clienteId) continue;
    for (const tela of midia.telas) {
      if (!clientesPorTela.has(tela.id)) clientesPorTela.set(tela.id, new Set());
      clientesPorTela.get(tela.id)!.add(midia.clienteId);
    }
  }
  const contagem = new Map<string, number>();
  for (const [telaId, clientes] of clientesPorTela) {
    contagem.set(telaId, clientes.size);
  }
  return contagem;
}
