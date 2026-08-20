"use client";

import { useActionState } from "react";
import { createIndicador, type IndicadorState } from "../actions";

const initialState: IndicadorState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700";

export function IndicadorForm() {
  const [state, formAction, pending] = useActionState(createIndicador, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="nome" className={labelClass}>
          Nome *
        </label>
        <input id="nome" name="nome" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="contato" className={labelClass}>
          Contato
        </label>
        <input id="contato" name="contato" placeholder="telefone ou e-mail" className={inputClass} />
      </div>
      <div>
        <label htmlFor="chavePix" className={labelClass}>
          Chave Pix
        </label>
        <input id="chavePix" name="chavePix" className={inputClass} />
      </div>
      <div>
        <label htmlFor="percentualPadrao" className={labelClass}>
          Percentual de comissão (%) *
        </label>
        <input
          id="percentualPadrao"
          name="percentualPadrao"
          type="number"
          step="0.1"
          min="0"
          max="100"
          required
          defaultValue={20}
          className={inputClass}
        />
      </div>

      {state.error && <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-iluminnus-navy px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar indicador"}
        </button>
      </div>
    </form>
  );
}
