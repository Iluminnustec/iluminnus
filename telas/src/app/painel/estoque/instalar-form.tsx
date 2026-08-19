"use client";

import { useActionState } from "react";
import { instalarItemNoPredio, type InstalarState } from "./actions";

const initialState: InstalarState = {};

export function InstalarForm({
  itemId,
  itemNome,
  predios,
}: {
  itemId: string;
  itemNome: string;
  predios: { id: string; nome: string }[];
}) {
  const [state, formAction, pending] = useActionState(instalarItemNoPredio, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="itemId" value={itemId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="instalarPredioId" className="block text-sm font-medium text-slate-700">
            Prédio *
          </label>
          <select
            id="instalarPredioId"
            name="predioId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="" disabled>
              Selecione um prédio
            </option>
            {predios.map((predio) => (
              <option key={predio.id} value={predio.id}>
                {predio.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="instalarTipo" className="block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="instalarTipo"
            name="tipo"
            defaultValue="TV_ELEVADOR"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="TV_ELEVADOR">TV no elevador</option>
            <option value="TOTEM_HALL">Totem no hall</option>
            <option value="TELA_HORIZONTAL">Tela horizontal (hall/estabelecimento)</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="instalarNome" className="block text-sm font-medium text-slate-700">
          Nome da tela *
        </label>
        <input
          id="instalarNome"
          name="nome"
          required
          defaultValue={itemNome}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brivox-bronze px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Instalando..." : "Instalar tela neste prédio"}
      </button>
    </form>
  );
}
