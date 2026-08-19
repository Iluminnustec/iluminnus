"use client";

import { useActionState, useRef } from "react";
import { criarTelasEmLote, type CriarTelasEmLoteState } from "@/app/painel/telas/actions";

const initialState: CriarTelasEmLoteState = {};

export function CriarTelasLoteForm({ predioId }: { predioId: string }) {
  const action = criarTelasEmLote.bind(null, predioId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <p className="text-sm font-medium text-slate-700">
        Criar várias telas de uma vez (útil quando o prédio tem mais de um elevador)
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          name="nomes"
          placeholder="Ex: Social, Serviço"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
        <select
          name="tipo"
          defaultValue="TV_ELEVADOR"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        >
          <option value="TV_ELEVADOR">TV no elevador</option>
          <option value="TOTEM_HALL">Totem no hall</option>
          <option value="TELA_HORIZONTAL">Tela horizontal</option>
          <option value="OUTRO">Outro</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-telas-navy px-4 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar telas"}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Separe os nomes por vírgula — cada um vira uma tela nova nesse prédio.
      </p>
      {state.error && <p className="mt-1 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
