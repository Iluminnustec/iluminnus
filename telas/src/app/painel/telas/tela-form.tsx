"use client";

import { useActionState } from "react";
import type { TelaState } from "./actions";

type TelaFormAction = (state: TelaState, formData: FormData) => Promise<TelaState>;

type TelaFormProps = {
  action: TelaFormAction;
  predios: { id: string; nome: string }[];
  defaultValues?: {
    nome?: string;
    predioId?: string;
    tipo?: string;
    status?: string;
    rotacao?: number;
    especificacoes?: string | null;
    observacoes?: string | null;
    precoBase?: number;
  };
  submitLabel: string;
};

const initialState: TelaState = {};

export function TelaForm({ action, predios, defaultValues, submitLabel }: TelaFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
            Nome da tela *
          </label>
          <input
            id="nome"
            name="nome"
            required
            defaultValue={defaultValues?.nome}
            placeholder="Ex: Elevador social 1"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="predioId" className="block text-sm font-medium text-slate-700">
            Prédio *
          </label>
          <select
            id="predioId"
            name="predioId"
            required
            defaultValue={defaultValues?.predioId ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={defaultValues?.tipo ?? "TV_ELEVADOR"}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          >
            <option value="TV_ELEVADOR">TV no elevador</option>
            <option value="TOTEM_HALL">Totem no hall</option>
            <option value="TELA_HORIZONTAL">Tela horizontal (hall/estabelecimento)</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "ATIVA"}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          >
            <option value="ATIVA">Ativa</option>
            <option value="INATIVA">Inativa</option>
            <option value="MANUTENCAO">Manutenção</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="rotacao" className="block text-sm font-medium text-slate-700">
          Rotação da tela (montagem física)
        </label>
        <select
          id="rotacao"
          name="rotacao"
          defaultValue={defaultValues?.rotacao ?? 0}
          className="mt-1 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        >
          <option value={0}>0° (paisagem normal)</option>
          <option value={90}>90°</option>
          <option value={180}>180°</option>
          <option value={270}>270°</option>
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Usado pelo app da TV pra saber como orientar o conteúdo nessa tela.
        </p>
      </div>

      <div>
        <label htmlFor="precoBase" className="block text-sm font-medium text-slate-700">
          Preço base (R$/mês)
        </label>
        <input
          id="precoBase"
          name="precoBase"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaultValues?.precoBase ?? 110}
          className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">
          Preço com a tela vazia. Sobe automaticamente conforme mais clientes anunciam nela (até 30).
        </p>
      </div>

      <div>
        <label htmlFor="especificacoes" className="block text-sm font-medium text-slate-700">
          Especificações (tamanho, resolução...)
        </label>
        <input
          id="especificacoes"
          name="especificacoes"
          defaultValue={defaultValues?.especificacoes ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
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
