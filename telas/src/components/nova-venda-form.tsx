"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { registrarVenda, type VendaState } from "@/app/painel/comissoes/actions";

const initialState: VendaState = {};

export function NovaVendaForm({
  clientes,
  vendedores,
}: {
  clientes: { id: string; nome: string; vendedorId: string | null }[];
  vendedores: { id: string; nome: string }[];
}) {
  const [state, formAction, pending] = useActionState(registrarVenda, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [clienteId, setClienteId] = useState("");
  const [vendedorId, setVendedorId] = useState("");

  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.id, c.vendedorId])),
    [clientes]
  );

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
        setClienteId("");
        setVendedorId("");
      }}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <label htmlFor="clienteId" className="block text-sm font-medium text-slate-700">
          Cliente *
        </label>
        <select
          id="clienteId"
          name="clienteId"
          required
          value={clienteId}
          onChange={(e) => {
            const novoClienteId = e.target.value;
            setClienteId(novoClienteId);
            const vendedorDoCliente = clienteMap[novoClienteId];
            if (vendedorDoCliente) setVendedorId(vendedorDoCliente);
          }}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        >
          <option value="" disabled>
            Selecione um cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="vendedorId" className="block text-sm font-medium text-slate-700">
          Vendedor *
        </label>
        <select
          id="vendedorId"
          name="vendedorId"
          required
          value={vendedorId}
          onChange={(e) => setVendedorId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        >
          <option value="" disabled>
            Selecione o vendedor
          </option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">Preenche sozinho se o cliente já tiver vendedor.</p>
      </div>

      <div>
        <label htmlFor="dataPagamento" className="block text-sm font-medium text-slate-700">
          Data do pagamento *
        </label>
        <input
          id="dataPagamento"
          name="dataPagamento"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">Define em qual mês essa venda entra na comissão.</p>
      </div>

      <div>
        <label htmlFor="valorVenda" className="block text-sm font-medium text-slate-700">
          Valor pago (R$) *
        </label>
        <input
          id="valorVenda"
          name="valorVenda"
          type="number"
          step="0.01"
          min="0"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
      </div>

      <div className="lg:col-span-4">
        <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">
          Observações
        </label>
        <input
          id="observacoes"
          name="observacoes"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
      </div>

      <div className="flex items-end justify-end lg:col-span-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-telas-navy px-5 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-60"
        >
          {pending ? "Registrando..." : "Registrar venda"}
        </button>
      </div>

      {state.error && <p className="text-sm text-red-600 lg:col-span-4">{state.error}</p>}
    </form>
  );
}
