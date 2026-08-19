"use client";

import { useActionState } from "react";
import { updateAssinatura, type AssinaturaState } from "../../actions";

const initialState: AssinaturaState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700";

export function AssinaturaForm({
  assinatura,
}: {
  assinatura: {
    id: string;
    empresaId: string;
    plano: string;
    valorMensal: number;
    diaVencimento: number;
    status: string;
  };
}) {
  const action = updateAssinatura.bind(null, assinatura.id, assinatura.empresaId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="plano" className={labelClass}>
          Plano
        </label>
        <input id="plano" name="plano" required defaultValue={assinatura.plano} className={inputClass} />
      </div>
      <div>
        <label htmlFor="status" className={labelClass}>
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={assinatura.status}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none"
        >
          <option value="ATIVA">Ativa</option>
          <option value="ATRASADA">Atrasada (ainda com acesso)</option>
          <option value="SUSPENSA">Suspensa (bloqueia o acesso)</option>
          <option value="CANCELADA">Cancelada (bloqueia o acesso)</option>
        </select>
      </div>
      <div>
        <label htmlFor="valorMensal" className={labelClass}>
          Valor mensal (R$)
        </label>
        <input
          id="valorMensal"
          name="valorMensal"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={assinatura.valorMensal}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="diaVencimento" className={labelClass}>
          Dia do vencimento
        </label>
        <input
          id="diaVencimento"
          name="diaVencimento"
          type="number"
          min="1"
          max="28"
          required
          defaultValue={assinatura.diaVencimento}
          className={inputClass}
        />
      </div>

      {state.error && <p className="col-span-2 text-sm text-red-600">{state.error}</p>}

      <div className="col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-iluminnus-navy px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar assinatura"}
        </button>
      </div>
    </form>
  );
}
