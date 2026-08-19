import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PrediosMapLoader } from "@/components/predios-map-loader";
import { PeriodFilter } from "@/components/period-filter";
import { calcularIntervalo } from "@/lib/period";
import {
  ReceitaDespesaPie,
  TelasStatusBar,
  ClientesStatusBar,
} from "@/components/dashboard-charts";
import { getSessaoComEmpresa } from "@/lib/auth";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessaoComEmpresa();
  const agora = new Date();
  const { inicio: inicioMes, fim: inicioProximoMes, label: periodoLabel } = calcularIntervalo(
    params.periodo,
    params.inicio,
    params.fim
  );

  const atrasoOuPendenteVencido = (status: "PENDENTE" | "ATRASADO") => ({
    OR: [{ status: "ATRASADO" as const }, { status: "PENDENTE" as const, vencimento: { lt: agora } }],
  });

  const [
    totalPredios,
    totalTelas,
    telasAtivas,
    totalClientes,
    cobrancasPendentes,
    cobrancasAtrasadas,
    despesasPendentes,
    despesasAtrasadas,
    cartaoEsteMes,
    itensDisponiveis,
    aReembolsarSocios,
    telasOffline,
  ] = await Promise.all([
    prisma.predio.count({ where: { empresaId: session.empresaId } }),
    prisma.tela.count({ where: { empresaId: session.empresaId } }),
    prisma.tela.count({ where: { status: "ATIVA", empresaId: session.empresaId } }),
    prisma.cliente.count({ where: { ativo: true, empresaId: session.empresaId } }),
    prisma.cobranca.aggregate({
      where: { status: "PENDENTE", empresaId: session.empresaId },
      _sum: { valor: true },
    }),
    prisma.cobranca.count({
      where: { ...atrasoOuPendenteVencido("ATRASADO"), empresaId: session.empresaId },
    }),
    prisma.despesaParcela.aggregate({
      where: { status: "PENDENTE", despesa: { empresaId: session.empresaId } },
      _sum: { valor: true },
    }),
    prisma.despesaParcela.count({
      where: { ...atrasoOuPendenteVencido("ATRASADO"), despesa: { empresaId: session.empresaId } },
    }),
    prisma.despesaParcela.aggregate({
      where: {
        vencimento: { gte: inicioMes, lt: inicioProximoMes },
        despesa: { formaPagamento: "CARTAO_CREDITO", empresaId: session.empresaId },
      },
      _sum: { valor: true },
    }),
    prisma.itemEstoque.count({ where: { status: "DISPONIVEL", empresaId: session.empresaId } }),
    prisma.despesa.aggregate({
      where: {
        pagoPorSocioId: { not: null },
        reembolsado: false,
        empresaId: session.empresaId,
      },
      _sum: { valorTotal: true },
    }),
    prisma.dispositivo.count({
      where: {
        telaId: { not: null },
        empresaId: session.empresaId,
        ultimoContato: { lt: new Date(Date.now() - 5 * 60 * 1000) },
      },
    }),
  ]);

  const [
    telasInativas,
    telasManutencao,
    clientesInativos,
    receitaMes,
    despesaMes,
  ] = await Promise.all([
    prisma.tela.count({ where: { status: "INATIVA", empresaId: session.empresaId } }),
    prisma.tela.count({ where: { status: "MANUTENCAO", empresaId: session.empresaId } }),
    prisma.cliente.count({ where: { ativo: false, empresaId: session.empresaId } }),
    prisma.cobranca.aggregate({
      where: { vencimento: { gte: inicioMes, lt: inicioProximoMes }, empresaId: session.empresaId },
      _sum: { valor: true },
    }),
    prisma.despesaParcela.aggregate({
      where: {
        vencimento: { gte: inicioMes, lt: inicioProximoMes },
        despesa: { empresaId: session.empresaId },
      },
      _sum: { valor: true },
    }),
  ]);

  const prediosComTelas = await prisma.predio.findMany({
    where: { latitude: { not: null }, longitude: { not: null }, empresaId: session.empresaId },
    select: {
      id: true,
      nome: true,
      bairro: true,
      latitude: true,
      longitude: true,
      _count: { select: { telas: true } },
    },
  });

  const pinsDoMapa = prediosComTelas.map((p) => ({
    id: p.id,
    nome: p.nome,
    bairro: p.bairro,
    latitude: p.latitude as number,
    longitude: p.longitude as number,
    totalTelas: p._count.telas,
  }));

  const receitaCards = [
    {
      label: "Prédios mapeados",
      value: totalPredios,
      href: "/painel/predios",
    },
    {
      label: "Telas ativas",
      value: `${telasAtivas} / ${totalTelas}`,
      href: "/painel/telas",
    },
    {
      label: "Telas offline",
      value: telasOffline,
      href: "/painel/telas",
      alert: telasOffline > 0,
    },
    {
      label: "Clientes ativos",
      value: totalClientes,
      href: "/painel/clientes",
    },
    {
      label: "A receber (pendente)",
      value: formatBRL(cobrancasPendentes._sum.valor ?? 0),
      href: "/painel/receitas",
    },
    {
      label: "Cobranças atrasadas",
      value: cobrancasAtrasadas,
      href: "/painel/receitas",
      alert: cobrancasAtrasadas > 0,
    },
  ];

  const despesaCards = [
    {
      label: "A pagar (pendente)",
      value: formatBRL(despesasPendentes._sum.valor ?? 0),
      href: "/painel/despesas",
    },
    {
      label: "Parcelas atrasadas",
      value: despesasAtrasadas,
      href: "/painel/despesas",
      alert: despesasAtrasadas > 0,
    },
    {
      label: "Cartão de crédito no período",
      value: formatBRL(cartaoEsteMes._sum.valor ?? 0),
      href: "/painel/despesas",
    },
    {
      label: "Itens em estoque",
      value: itensDisponiveis,
      href: "/painel/estoque",
    },
    {
      label: "A reembolsar sócios",
      value: formatBRL(aReembolsarSocios._sum.valorTotal ?? 0),
      href: "/painel/despesas",
      alert: (aReembolsarSocios._sum.valorTotal ?? 0) > 0,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Visão geral da operação.</p>
        </div>
        <PeriodFilter />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Receitas
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {receitaCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-5 hover:border-brivox-blue hover:shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                card.alert ? "text-red-600" : "text-slate-900"
              }`}
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Despesas e estoque
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {despesaCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-5 hover:border-brivox-blue hover:shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                card.alert ? "text-red-600" : "text-slate-900"
              }`}
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Gráficos
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReceitaDespesaPie
          receita={receitaMes._sum.valor ?? 0}
          despesa={despesaMes._sum.valor ?? 0}
          periodoLabel={periodoLabel}
        />
        <TelasStatusBar
          ativas={telasAtivas}
          inativas={telasInativas}
          manutencao={telasManutencao}
        />
        <ClientesStatusBar ativos={totalClientes} inativos={clientesInativos} />
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Mapa dos prédios
      </h2>
      <div className="mt-3 h-64 max-w-2xl overflow-hidden rounded-lg border border-slate-200">
        {pinsDoMapa.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-400">
            Nenhum prédio com coordenadas cadastradas ainda. Adicione
            latitude/longitude em um prédio para ele aparecer aqui.
          </div>
        ) : (
          <PrediosMapLoader predios={pinsDoMapa} />
        )}
      </div>
    </div>
  );
}
