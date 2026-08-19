"use client";

import { useActionState } from "react";
import { updateUsuario, type UsuarioState } from "../actions";
import { PasswordInput } from "@/components/password-input";

const initialState: UsuarioState = {};

export function EditarUsuarioForm({
  usuario,
}: {
  usuario: {
    id: string;
    nome: string;
    email: string;
    cargo: string;
    ativo: boolean;
  };
}) {
  const action = updateUsuario.bind(null, usuario.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
          Nome *
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={usuario.nome}
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
          defaultValue={usuario.email}
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
          defaultValue={usuario.cargo}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        >
          <option value="ADMIN">Administrador — acesso total</option>
          <option value="SOCIO">Sócio — tudo, menos usuários e atividades</option>
          <option value="SUPERVISOR">Supervisor — tudo, menos usuários</option>
          <option value="VENDAS">Vendas — só Clientes</option>
        </select>
      </div>

      <div>
        <label htmlFor="novaSenha" className="block text-sm font-medium text-slate-700">
          Nova senha (opcional)
        </label>
        <PasswordInput
          id="novaSenha"
          name="novaSenha"
          minLength={8}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">Deixe em branco para manter a senha atual.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="ativo" defaultChecked={usuario.ativo} className="h-4 w-4" />
        Usuário ativo (desmarque para bloquear o acesso sem excluir)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brivox-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
