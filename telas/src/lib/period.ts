const DIA_MS = 24 * 60 * 60 * 1000;

export function calcularIntervalo(periodo: string | undefined, inicioParam?: string, fimParam?: string) {
  const agora = new Date();
  const ano = agora.getUTCFullYear();
  const mes = agora.getUTCMonth();

  if (periodo === "mes-anterior") {
    return {
      inicio: new Date(Date.UTC(ano, mes - 1, 1)),
      fim: new Date(Date.UTC(ano, mes, 1)),
      label: "mês anterior",
    };
  }

  if (periodo === "90-dias") {
    const fim = new Date(Date.UTC(ano, mes, agora.getUTCDate() + 1));
    return { inicio: new Date(fim.getTime() - 90 * DIA_MS), fim, label: "90 dias" };
  }

  if (periodo === "tudo") {
    return {
      inicio: new Date(Date.UTC(2000, 0, 1)),
      fim: new Date(Date.UTC(2100, 0, 1)),
      label: "todo o período",
    };
  }

  if (periodo === "personalizado" && inicioParam && fimParam) {
    const inicio = new Date(`${inicioParam}T00:00:00.000Z`);
    const fim = new Date(new Date(`${fimParam}T00:00:00.000Z`).getTime() + DIA_MS);
    return { inicio, fim, label: "período personalizado" };
  }

  return {
    inicio: new Date(Date.UTC(ano, mes, 1)),
    fim: new Date(Date.UTC(ano, mes + 1, 1)),
    label: "mês atual",
  };
}
