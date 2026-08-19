// Comissao por faixa sobre o faturamento novo efetivamente pago no mes.
// A faixa aplica sobre o TOTAL do mes (nao e marginal/progressiva):
// vendeu 70.000 no mes -> 70.000 inteiro cai na faixa de 6%, nao so o
// excedente acima de 60.000.
export const FAIXAS_COMISSAO = [
  { min: 0, max: 39999.99, percentual: 0, label: "Sem comissão" },
  { min: 40000, max: 49999.99, percentual: 4, label: "4%" },
  { min: 50000, max: 59999.99, percentual: 5, label: "5%" },
  { min: 60000, max: Infinity, percentual: 6, label: "6%" },
] as const;

export function faixaPorTotalVendido(totalVendido: number) {
  return (
    FAIXAS_COMISSAO.find((faixa) => totalVendido >= faixa.min && totalVendido <= faixa.max) ??
    FAIXAS_COMISSAO[0]
  );
}

export function calcularComissaoMensal(totalVendido: number) {
  const faixa = faixaPorTotalVendido(totalVendido);
  const valorComissao = Math.round(totalVendido * (faixa.percentual / 100) * 100) / 100;
  return { percentual: faixa.percentual, label: faixa.label, valorComissao };
}

// Chave do mes de referencia a partir de uma data (primeiro dia do mes, UTC).
export function inicioDoMes(data: Date): Date {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), 1));
}

export function formatarMesReferencia(data: Date): string {
  return data.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
}
