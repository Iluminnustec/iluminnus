"use client";

import { useTransition } from "react";
import { updateEmpresaIndicador } from "../../actions";

export function IndicadorSelect({
  empresaId,
  indicadorAtualId,
  indicadores,
}: {
  empresaId: string;
  indicadorAtualId: string;
  indicadores: { id: string; nome: string; ativo: boolean }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={indicadorAtualId}
      disabled={pending}
      onChange={(e) => {
        const valor = e.target.value || null;
        startTransition(() => {
          updateEmpresaIndicador(empresaId, valor);
        });
      }}
      className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none disabled:opacity-60"
    >
      <option value="">Ninguém (cadastro direto)</option>
      {indicadores.map((indicador) => (
        <option key={indicador.id} value={indicador.id}>
          {indicador.nome}
          {!indicador.ativo && " (inativo)"}
        </option>
      ))}
    </select>
  );
}
