"use client";

import { useActionState } from "react";
import { alterarSenha, type SenhaState } from "./actions";

const initialState: SenhaState = {};

export default function AlterarSenhaPage() {
  const [state, formAction, pending] = useActionState(alterarSenha, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Alterar senha</h1>
      <p className="mt-1 text-sm text-slate-500">
        Troque a senha da sua conta de administrador.
      </p>

      <form action={formAction} className="mt-6 max-w-sm space-y-4">
        <div>
          <label htmlFor="senhaAtual" className="block text-sm font-medium text-slate-700">
            Senha atual
          </label>
          <input
            id="senhaAtual"
            name="senhaAtual"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="novaSenha" className="block text-sm font-medium text-slate-700">
            Nova senha
          </label>
          <input
            id="novaSenha"
            name="novaSenha"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">Mínimo de 8 caracteres.</p>
        </div>

        <div>
          <label htmlFor="confirmarSenha" className="block text-sm font-medium text-slate-700">
            Confirmar nova senha
          </label>
          <input
            id="confirmarSenha"
            name="confirmarSenha"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-green-700">Senha alterada com sucesso.</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brivox-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Alterar senha"}
        </button>
      </form>
    </div>
  );
}
