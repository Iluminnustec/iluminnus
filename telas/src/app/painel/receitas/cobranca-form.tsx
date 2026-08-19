"use client";

import { useActionState } from "react";
import type { CobrancaState } from "./actions";

type CobrancaFormAction = (state: CobrancaState, formData: FormData) => Promise<CobrancaState>;

type CobrancaFormProps = {
  action: CobrancaFormAction;
  clientes: { id: string; nome: string }[];
  defaultValues?: {
    descricao?: string;
    clienteId?: string;
    valor?: number;
    vencimento?: Date;
    status?: string;
    observacoes?: string | null;
  };
  submitLabel: string;
};

const initialState: CobrancaState = {};

function toDateInputValue(date?: Date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function CobrancaForm({
  action,
  clientes,
  defaultValues,
  submitLabel,
}: CobrancaFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-slate-700">
          Descrição *
        </label>
        <input
          id="descricao"
          name="descricao"
          required
          defaultValue={defaultValues?.descricao}
          placeholder="Ex: Mensalidade de veiculação - Agosto/2026"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="clienteId" className="block text-sm font-medium text-slate-700">
          Cliente *
        </label>
        <select
          id="clienteId"
          name="clienteId"
          required
          defaultValue={defaultValues?.clienteId ?? ""}
          className="mt-1 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        >
          <option value="" disabled>
            Selecione um cliente
          </option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-slate-700">
            Valor (R$) *
          </label>
          <input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.valor}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="vencimento" className="block text-sm font-medium text-slate-700">
            Vencimento *
          </label>
          <input
            id="vencimento"
            name="vencimento"
            type="date"
            required
            defaultValue={toDateInputValue(defaultValues?.vencimento)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "PENDENTE"}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          >
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="ATRASADO">Atrasado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={defaultValues?.observacoes ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-telas-navy px-5 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
