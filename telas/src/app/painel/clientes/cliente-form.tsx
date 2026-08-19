"use client";

import { useActionState } from "react";
import type { ClienteState } from "./actions";

type ClienteFormAction = (
  state: ClienteState,
  formData: FormData
) => Promise<ClienteState>;

type ClienteFormProps = {
  action: ClienteFormAction;
  vendedores: { id: string; nome: string }[];
  defaultValues?: {
    nome?: string;
    razaoSocial?: string | null;
    cnpjCpf?: string | null;
    email?: string | null;
    telefone?: string | null;
    endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
    planoTelas?: number | null;
    vendedorId?: string | null;
    observacoes?: string | null;
  };
  submitLabel: string;
};

const initialState: ClienteState = {};

export function ClienteForm({ action, vendedores, defaultValues, submitLabel }: ClienteFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome *" name="nome" defaultValue={defaultValues?.nome} required />
        <Field
          label="Razão social"
          name="razaoSocial"
          defaultValue={defaultValues?.razaoSocial ?? ""}
        />
        <Field label="CNPJ/CPF" name="cnpjCpf" defaultValue={defaultValues?.cnpjCpf ?? ""} />
        <Field label="E-mail" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        <Field label="Telefone" name="telefone" defaultValue={defaultValues?.telefone ?? ""} />
        <Field label="CEP" name="cep" defaultValue={defaultValues?.cep ?? ""} />
      </div>

      <Field label="Endereço" name="endereco" defaultValue={defaultValues?.endereco ?? ""} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Bairro" name="bairro" defaultValue={defaultValues?.bairro ?? ""} />
        <Field label="Cidade" name="cidade" defaultValue={defaultValues?.cidade ?? "João Pessoa"} />
        <Field label="Estado" name="estado" defaultValue={defaultValues?.estado ?? "PB"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="planoTelas" className="block text-sm font-medium text-slate-700">
            Pacote contratado (qtd. de telas)
          </label>
          <input
            id="planoTelas"
            name="planoTelas"
            type="number"
            min="0"
            defaultValue={defaultValues?.planoTelas ?? ""}
            placeholder="Ex: 5, 10, 15, 20"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="vendedorId" className="block text-sm font-medium text-slate-700">
            Vendedor responsável
          </label>
          <select
            id="vendedorId"
            name="vendedorId"
            defaultValue={defaultValues?.vendedorId ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          >
            <option value="">Não informado</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Usado pra calcular a comissão da venda em Painel → Comissões.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Observações</label>
        <textarea
          name="observacoes"
          defaultValue={defaultValues?.observacoes ?? ""}
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
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
      />
    </div>
  );
}
