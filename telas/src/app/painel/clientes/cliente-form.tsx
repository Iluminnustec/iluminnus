"use client";

import { useState } from "react";
import { useActionState } from "react";
import { MessageCircle, Mail, Copy, CheckCircle2 } from "lucide-react";
import type { ClienteState } from "./actions";

type ClienteFormAction = (
  state: ClienteState,
  formData: FormData
) => Promise<ClienteState>;

type ClienteFormProps = {
  action: ClienteFormAction;
  vendedores: { id: string; nome: string }[];
  vendedorTravado?: boolean;
  ocultarVendedor?: boolean;
  mostrarMotivo?: boolean;
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

export function ClienteForm({
  action,
  vendedores,
  vendedorTravado,
  ocultarVendedor,
  mostrarMotivo,
  defaultValues,
  submitLabel,
}: ClienteFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state.sucesso) {
    return <ConfirmacaoCliente sucesso={state.sucesso} />;
  }

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Bairro" name="bairro" defaultValue={defaultValues?.bairro ?? ""} />
        <Field label="Cidade" name="cidade" defaultValue={defaultValues?.cidade ?? "João Pessoa"} />
        <Field label="Estado" name="estado" defaultValue={defaultValues?.estado ?? "PB"} />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        {!ocultarVendedor && (
          <div>
            <label htmlFor="vendedorId" className="block text-sm font-medium text-slate-700">
              Vendedor responsável
            </label>
            {vendedorTravado ? (
              <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Você (vinculado automaticamente)
              </p>
            ) : (
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
            )}
            <p className="mt-1 text-xs text-slate-400">
              Usado pra calcular a comissão da venda em Painel → Comissões.
            </p>
          </div>
        )}
      </div>

      {mostrarMotivo && (
        <div>
          <label htmlFor="motivo" className="block text-sm font-medium text-slate-700">
            Motivo da alteração (opcional)
          </label>
          <input
            id="motivo"
            name="motivo"
            placeholder="Ex: cliente pediu pra trocar o pacote"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          />
        </div>
      )}

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

function ConfirmacaoCliente({
  sucesso,
}: {
  sucesso: NonNullable<ClienteState["sucesso"]>;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(sucesso.linkAtivacao);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponível -- sem problema, o link continua selecionável
      // manualmente no campo abaixo.
    }
  }

  return (
    <div className="mt-6 max-w-xl">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-900">{sucesso.nome} foi cadastrado(a)!</p>
          <p className="mt-0.5 text-sm text-emerald-800">
            Agora falta o cliente finalizar: definir a senha e acompanhar as propostas. Envie o
            link abaixo pra ele(a).
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-700">Link de ativação (uso único)</p>
        <div className="mt-2 flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {sucesso.linkAtivacao}
          </code>
          <button
            type="button"
            onClick={copiarLink}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {sucesso.whatsappHref && (
            <a
              href={sucesso.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar por WhatsApp
            </a>
          )}
          {sucesso.mailtoHref && (
            <a
              href={sucesso.mailtoHref}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Mail className="h-4 w-4" />
              Enviar por e-mail
            </a>
          )}
        </div>
      </div>

      {/* <a> nativa (não next/link) de propósito: força reload completo pra
          resetar o estado do useActionState, já que a rota é a mesma. */}
      <a
        href="/painel/clientes/novo"
        className="mt-4 inline-block text-sm font-medium text-telas-blue hover:underline"
      >
        Cadastrar outro cliente
      </a>
    </div>
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
