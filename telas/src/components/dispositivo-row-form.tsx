"use client";

import { useActionState, useEffect, useState } from "react";
import type { DispositivoState } from "@/app/painel/dispositivos/actions";

type Acao = (state: DispositivoState, formData: FormData) => Promise<DispositivoState>;

const initialState: DispositivoState = {};

export function DispositivoRowForm({
  acao,
  apelido,
  telaId,
  telaNomeAtual,
  telas,
}: {
  acao: Acao;
  apelido: string;
  telaId: string;
  telaNomeAtual: string | null;
  telas: { id: string; nome: string; predioNome: string }[];
}) {
  const [state, formAction, pending] = useActionState(acao, initialState);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  useEffect(() => {
    if (state.salvo) {
      setMostrarConfirmacao(true);
      const timeout = setTimeout(() => setMostrarConfirmacao(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <div>
      <form action={formAction} className="flex items-center gap-2">
        <input
          type="text"
          name="apelido"
          defaultValue={apelido}
          placeholder="Apelido (opcional)"
          className="w-32 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <select
          name="telaId"
          defaultValue={telaId}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
        >
          <option value="">Não atribuída</option>
          {telas.map((tela) => (
            <option key={tela.id} value={tela.id}>
              {tela.predioNome} — {tela.nome}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-brivox-navy bg-brivox-navy px-3 py-1 text-xs font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </form>
      <p className="mt-1 text-[11px] text-slate-400">
        Atualmente: {telaNomeAtual ?? "nenhuma tela atribuída"}
      </p>
      {mostrarConfirmacao && (
        <p className="mt-1 text-[11px] font-medium text-green-600">
          ✓ Salvo — a caixinha pega a mudança no próximo contato (até 1 min).
        </p>
      )}
    </div>
  );
}
