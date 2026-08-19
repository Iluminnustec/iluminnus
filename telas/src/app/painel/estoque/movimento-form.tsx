"use client";

import { useActionState } from "react";
import { registrarMovimento, type MovimentoState } from "./actions";

const initialState: MovimentoState = {};

export function MovimentoForm({ itemId }: { itemId: string }) {
  const [state, formAction, pending] = useActionState(registrarMovimento, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="itemId" value={itemId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="movTipo" className="block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="movTipo"
            name="tipo"
            defaultValue="ENTRADA"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>

        <div>
          <label htmlFor="movQuantidade" className="block text-sm font-medium text-slate-700">
            Quantidade *
          </label>
          <input
            id="movQuantidade"
            name="quantidade"
            type="number"
            min="1"
            required
            defaultValue={1}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="movData" className="block text-sm font-medium text-slate-700">
            Data
          </label>
          <input
            id="movData"
            name="data"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="movMotivo" className="block text-sm font-medium text-slate-700">
          Motivo *
        </label>
        <input
          id="movMotivo"
          name="motivo"
          required
          placeholder="Ex: Compra adicional, devolução, item danificado..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brivox-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
      >
        {pending ? "Registrando..." : "Registrar movimentação"}
      </button>
    </form>
  );
}
