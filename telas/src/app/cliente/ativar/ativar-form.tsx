"use client";

import { useActionState } from "react";
import { ativarContaCliente, type ClienteAuthState } from "../actions";
import { PasswordInput } from "@/components/password-input";

const initialState: ClienteAuthState = {};

export function AtivarForm({ token, emailJaTem }: { token: string; emailJaTem: boolean }) {
  const [state, formAction, pending] = useActionState(ativarContaCliente, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      {!emailJaTem && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Seu e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">É o que você vai usar pra entrar depois.</p>
        </div>
      )}

      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
          Crie sua senha
        </label>
        <PasswordInput
          id="senha"
          name="senha"
          required
          minLength={8}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">Pelo menos 8 caracteres.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-telas-navy px-4 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-60"
      >
        {pending ? "Ativando..." : "Ativar conta e entrar"}
      </button>
    </form>
  );
}
