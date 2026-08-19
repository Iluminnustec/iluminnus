"use client";

import { useActionState, useState } from "react";
import { adicionarEstoque, type ItemEstoqueState } from "./actions";

const initialState: ItemEstoqueState = {};

const NOVO_ITEM = "";

export function AdicionarEstoqueForm({
  itens,
}: {
  itens: { id: string; nome: string; quantidade: number }[];
}) {
  const [state, formAction, pending] = useActionState(adicionarEstoque, initialState);
  const [itemId, setItemId] = useState(NOVO_ITEM);
  const ehItemExistente = itemId !== NOVO_ITEM;

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <div>
        <label htmlFor="itemId" className="block text-sm font-medium text-slate-700">
          Item *
        </label>
        <select
          id="itemId"
          name="itemId"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        >
          <option value={NOVO_ITEM}>+ Novo item (nome diferente de tudo que já existe)</option>
          {itens.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome} — {item.quantidade} em estoque
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Já tem esse item cadastrado? Selecione ele aqui em vez de criar um
          duplicado — isso só soma a quantidade nova ao que já existe.
        </p>
      </div>

      {ehItemExistente ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-slate-700">
                Quantidade a adicionar *
              </label>
              <input
                id="quantidade"
                name="quantidade"
                type="number"
                min="1"
                required
                defaultValue={1}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-slate-700">
                Data
              </label>
              <input
                id="data"
                name="data"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-slate-700">
              Motivo
            </label>
            <input
              id="motivo"
              name="motivo"
              placeholder="Ex: Compra adicional, devolução..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
                Nome do item *
              </label>
              <input
                id="nome"
                name="nome"
                required
                placeholder='Ex: Totem vertical 55"'
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">
                Categoria
              </label>
              <input
                id="categoria"
                name="categoria"
                placeholder="Ex: Totem, Player, Suporte"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-slate-700">
                Quantidade inicial
              </label>
              <input
                id="quantidade"
                name="quantidade"
                type="number"
                min="1"
                defaultValue={1}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
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
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-slate-700">
                Data de entrada
              </label>
              <input
                id="data"
                name="data"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
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
                defaultValue="DISPONIVEL"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="EM_USO">Em uso</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="BAIXADO">Baixado</option>
              </select>
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-telas-navy px-5 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : ehItemExistente ? "Adicionar ao estoque" : "Criar item"}
      </button>
    </form>
  );
}
