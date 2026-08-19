"use client";

import { useActionState, useState } from "react";
import type { DespesaState } from "./actions";

type DespesaFormAction = (state: DespesaState, formData: FormData) => Promise<DespesaState>;

type DespesaFormProps = {
  action: DespesaFormAction;
  usuarios: { id: string; nome: string }[];
  defaultValues?: {
    descricao?: string;
    categoria?: string;
    fornecedor?: string | null;
    valorTotal?: number;
    dataCompra?: Date;
    formaPagamento?: string;
    numeroParcelas?: number;
    faturarMesSeguinte?: boolean;
    observacoes?: string | null;
    pagoPorSocioId?: string | null;
  };
  submitLabel: string;
  isEdit?: boolean;
};

const initialState: DespesaState = {};

function toDateInputValue(date?: Date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function DespesaForm({
  action,
  usuarios,
  defaultValues,
  submitLabel,
  isEdit,
}: DespesaFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [formaPagamento, setFormaPagamento] = useState(
    defaultValues?.formaPagamento ?? "A_VISTA"
  );

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
          placeholder="Ex: Totem vertical 55&quot; - 5 unidades"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={defaultValues?.categoria ?? "EQUIPAMENTO"}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="EQUIPAMENTO">Equipamento</option>
            <option value="ESTOQUE">Estoque</option>
            <option value="INSTALACAO">Instalação</option>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="MARKETING">Marketing</option>
            <option value="ADMINISTRATIVO">Administrativo</option>
            <option value="COMISSAO">Comissão</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>

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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="valorTotal" className="block text-sm font-medium text-slate-700">
            Valor total (R$) *
          </label>
          <input
            id="valorTotal"
            name="valorTotal"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.valorTotal}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="dataCompra" className="block text-sm font-medium text-slate-700">
            Data da compra *
          </label>
          <input
            id="dataCompra"
            name="dataCompra"
            type="date"
            required
            defaultValue={toDateInputValue(defaultValues?.dataCompra) || new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="formaPagamento" className="block text-sm font-medium text-slate-700">
            Forma de pagamento
          </label>
          <select
            id="formaPagamento"
            name="formaPagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="A_VISTA">À vista</option>
            <option value="CARTAO_CREDITO">Cartão de crédito</option>
            <option value="PIX">PIX</option>
            <option value="BOLETO">Boleto</option>
            <option value="TRANSFERENCIA">Transferência</option>
          </select>
        </div>

        <div>
          <label htmlFor="numeroParcelas" className="block text-sm font-medium text-slate-700">
            Número de parcelas
          </label>
          <input
            id="numeroParcelas"
            name="numeroParcelas"
            type="number"
            min="1"
            max="48"
            defaultValue={defaultValues?.numeroParcelas ?? 1}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>
      </div>

      {formaPagamento === "CARTAO_CREDITO" && (
        <div className="max-w-xs">
          <label htmlFor="faturarMesSeguinte" className="block text-sm font-medium text-slate-700">
            Faturar a partir de
          </label>
          <select
            id="faturarMesSeguinte"
            name="faturarMesSeguinte"
            defaultValue={defaultValues?.faturarMesSeguinte ? "SEGUINTE" : "ATUAL"}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="ATUAL">Este mês (fatura já fechando)</option>
            <option value="SEGUINTE">Mês seguinte (fatura já fechou)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Se a fatura do cartão já fechou quando você fez a compra, a
            primeira cobrança só vai entrar no mês seguinte.
          </p>
        </div>
      )}

      {isEdit && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Atenção: se você alterar valor, data, forma de pagamento ou número
          de parcelas, todas as parcelas serão recriadas do zero — o status
          de pagamento das parcelas atuais será perdido.
        </p>
      )}

      <div className="max-w-sm">
        <label htmlFor="pagoPorSocioId" className="block text-sm font-medium text-slate-700">
          Pago com recursos de
        </label>
        <select
          id="pagoPorSocioId"
          name="pagoPorSocioId"
          defaultValue={defaultValues?.pagoPorSocioId ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        >
          <option value="">Caixa da empresa</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.id}>
              Adiantado por {usuario.nome}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Se alguém pagou do próprio bolso porque ainda não entrou dinheiro da
          empresa, selecione a pessoa aqui — isso fica marcado como pendente
          de reembolso até você marcar como devolvido.
        </p>
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
