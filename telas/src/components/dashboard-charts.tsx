"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CORES = {
  receita: "#4169e1",
  despesa: "#cd7f32",
  ativa: "#16a34a",
  inativa: "#94a3b8",
  manutencao: "#f59e0b",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ReceitaDespesaPie({
  receita,
  despesa,
  periodoLabel = "mês",
}: {
  receita: number;
  despesa: number;
  periodoLabel?: string;
}) {
  const data = [
    { name: "Receita", value: receita },
    { name: "Despesa", value: despesa },
  ];
  const semDados = receita === 0 && despesa === 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-700">Receita x Despesa ({periodoLabel})</p>
      {semDados ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          Sem lançamentos no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
              <Cell fill={CORES.receita} />
              <Cell fill={CORES.despesa} />
            </Pie>
            <Tooltip formatter={(value) => formatBRL(Number(value))} />
            <Legend verticalAlign="bottom" height={24} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function TelasStatusBar({
  ativas,
  inativas,
  manutencao,
}: {
  ativas: number;
  inativas: number;
  manutencao: number;
}) {
  const data = [
    { name: "Ativas", total: ativas, fill: CORES.ativa },
    { name: "Inativas", total: inativas, fill: CORES.inativa },
    { name: "Manutenção", total: manutencao, fill: CORES.manutencao },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-700">Telas por status</p>
      <ResponsiveContainer width="100%" height={192}>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClientesStatusBar({
  ativos,
  inativos,
}: {
  ativos: number;
  inativos: number;
}) {
  const data = [
    { name: "Ativos", total: ativos, fill: CORES.ativa },
    { name: "Inativos", total: inativos, fill: CORES.inativa },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-700">Clientes ativos</p>
      <ResponsiveContainer width="100%" height={192}>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
