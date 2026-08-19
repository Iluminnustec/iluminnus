"use client";

import { useActionState } from "react";
import { registrarPagamento, type PagamentoState } from "../../actions";

const initialState: PagamentoState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700";

function mesAtual() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

export function PagamentoForm({
  assinaturaId,
  empresaId,
}: {
  assinaturaId: string;
  empresaId: string;
}) {
  const action = registrarPagamento.bind(null, assinaturaId, empresaId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="valor" className={labelClass}>
          Valor pago (R$) *
        </label>
        <input
          id="valor"
          name="valor"
          type="number"
          step="0.01"
          min="0.01"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="referencia" className={labelClass}>
          Mês de referência *
        </label>
        <input
          id="referencia"
          name="referencia"
          type="month"
          required
          defaultValue={mesAtual()}
          className={inputClass}
        />
      </div>
      <div className="col-span-2">
        <label htmlFor="observacoes" className={labelClass}>
          Observações
        </label>
        <input id="observacoes" name="observacoes" className={inputClass} />
      </div>

      {state.error && <p className="col-span-2 text-sm text-red-600">{state.error}</p>}

      <div className="col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-iluminnus-navy px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Registrando..." : "Registrar pagamento"}
        </button>
        <p className="mt-2 text-xs text-slate-500">
          Registrar um pagamento reativa a assinatura (status volta para Ativa) e empurra o
          próximo vencimento para o mês seguinte ao de referência.
        </p>
      </div>
    </form>
  );
}
