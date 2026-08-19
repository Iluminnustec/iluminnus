"use client";

import { useActionState } from "react";
import { createUsuario, type UsuarioState } from "../actions";

const initialState: UsuarioState = {};

export default function NovoUsuarioPage() {
  const [state, formAction, pending] = useActionState(createUsuario, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Novo usuário</h1>

      <form action={formAction} className="mt-6 max-w-md space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
            Nome *
          </label>
          <input
            id="nome"
            name="nome"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cargo" className="block text-sm font-medium text-slate-700">
            Cargo
          </label>
          <select
            id="cargo"
            name="cargo"
            defaultValue="SUPERVISOR"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          >
            <option value="ADMIN">Administrador — acesso total</option>
            <option value="SOCIO">Sócio — tudo, menos usuários e atividades</option>
            <option value="SUPERVISOR">Supervisor — tudo, menos usuários</option>
            <option value="VENDAS">Vendas — só Clientes</option>
          </select>
        </div>

        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
            Senha inicial *
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Mínimo de 8 caracteres. Combine com a pessoa e recomende trocar no primeiro acesso.
          </p>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brivox-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar usuário"}
        </button>
      </form>
    </div>
  );
}
