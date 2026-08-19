"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { criarContaTelas, type AssinarState } from "./actions";

const initialState: AssinarState = {};

export default function AssinarPage() {
  const [state, formAction, pending] = useActionState(criarContaTelas, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/telas-icon.png"
            alt="Telas"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-semibold text-slate-900">Telas</span>
        </Link>

        <h1 className="mt-6 text-xl font-bold text-slate-900">Assine o Telas</h1>
        <p className="mt-1 text-sm text-slate-500">
          14 dias de teste grátis. Sem cartão de crédito agora.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="empresaNome" className="block text-sm font-medium text-slate-700">
              Nome da empresa
            </label>
            <input
              id="empresaNome"
              name="empresaNome"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-slate-700">
              Cidade
            </label>
            <input
              id="cidade"
              name="cidade"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="adminNome" className="block text-sm font-medium text-slate-700">
              Seu nome
            </label>
            <input
              id="adminNome"
              name="adminNome"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="adminSenha" className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id="adminSenha"
              name="adminSenha"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">Pelo menos 8 caracteres.</p>
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brivox-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
          >
            {pending ? "Criando conta..." : "Começar teste grátis"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brivox-blue hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
