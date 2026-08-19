"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const OPCOES = [
  { value: "mes-atual", label: "Mês atual" },
  { value: "mes-anterior", label: "Mês anterior" },
  { value: "90-dias", label: "90 dias" },
  { value: "tudo", label: "Tudo" },
];

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const periodoAtual = searchParams.get("periodo") ?? "mes-atual";

  const [showCustom, setShowCustom] = useState(periodoAtual === "personalizado");
  const [inicio, setInicio] = useState(searchParams.get("inicio") ?? "");
  const [fim, setFim] = useState(searchParams.get("fim") ?? "");

  function selecionar(periodo: string) {
    if (periodo === "personalizado") {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    router.push(`${pathname}?periodo=${periodo}`);
  }

  function aplicarPersonalizado() {
    if (!inicio || !fim) return;
    router.push(`${pathname}?periodo=personalizado&inicio=${inicio}&fim=${fim}`);
    setShowCustom(false);
  }

  return (
    <div className="relative">
      <div className="inline-flex items-center gap-1 rounded-full bg-brivox-navy p-1 text-sm">
        {OPCOES.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => selecionar(o.value)}
            className={`rounded-full px-3 py-1.5 font-medium transition ${
              periodoAtual === o.value
                ? "bg-brivox-bronze text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => selecionar("personalizado")}
          className={`rounded-full px-3 py-1.5 font-medium transition ${
            periodoAtual === "personalizado"
              ? "bg-brivox-bronze text-white"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Personalizado
        </button>
      </div>

      {showCustom && (
        <div className="absolute right-0 top-full z-20 mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700"
          />
          <span className="text-slate-400">até</span>
          <input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700"
          />
          <button
            type="button"
            onClick={aplicarPersonalizado}
            disabled={!inicio || !fim}
            className="rounded bg-brivox-navy px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
