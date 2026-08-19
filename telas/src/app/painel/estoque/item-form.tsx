"use client";

import { useActionState } from "react";
import type { ItemEstoqueState } from "./actions";

type ItemFormAction = (state: ItemEstoqueState, formData: FormData) => Promise<ItemEstoqueState>;

type ItemFormProps = {
  action: ItemFormAction;
  defaultValues?: {
    nome?: string;
    categoria?: string | null;
    quantidade?: number;
    valorUnitario?: number | null;
    fornecedor?: string | null;
    dataEntrada?: Date;
    status?: string;
    observacoes?: string | null;
  };
  submitLabel: string;
  isEdit?: boolean;
};

const initialState: ItemEstoqueState = {};

function toDateInputValue(date?: Date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function ItemForm({ action, defaultValues, submitLabel, isEdit }: ItemFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
            Nome do item *
          </label>
          <input
            id="nome"
            name="nome"
            required
            defaultValue={defaultValues?.nome}
            placeholder='Ex: Totem vertical 55"'
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">
            Categoria
          </label>
          <input
            id="categoria"
            name="categoria"
            defaultValue={defaultValues?.categoria ?? ""}
            placeholder="Ex: Totem, Player, Suporte"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>
      </div>

      <div className={`grid gap-4 ${isEdit ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {!isEdit && (
          <div>
            <label htmlFor="quantidade" className="block text-sm font-medium text-slate-700">
              Quantidade inicial
            </label>
            <input
              id="quantidade"
              name="quantidade"
              type="number"
              min="0"
              defaultValue={defaultValues?.quantidade ?? 1}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
            />
          </div>
        )}

        <div>
          <label htmlFor="valorUnitario" className="block text-sm font-medium text-slate-700">
            Valor unitário (R$)
          </label>
          <input
            id="valorUnitario"
            name="valorUnitario"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.valorUnitario ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="dataEntrada" className="block text-sm font-medium text-slate-700">
            Data de entrada
          </label>
          <input
            id="dataEntrada"
            name="dataEntrada"
            type="date"
            defaultValue={toDateInputValue(defaultValues?.dataEntrada)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fornecedor" className="block text-sm font-medium text-slate-700">
            Fornecedor
          </label>
          <input
            id="fornecedor"
            name="fornecedor"
            defaultValue={defaultValues?.fornecedor ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "DISPONIVEL"}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="DISPONIVEL">Disponível</option>
            <option value="EM_USO">Em uso</option>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="BAIXADO">Baixado</option>
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
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brivox-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
