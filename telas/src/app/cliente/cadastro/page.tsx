"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cadastroClienteAction, type ClienteAuthState } from "../actions";
import { PasswordInput } from "@/components/password-input";

const initialState: ClienteAuthState = {};

export default function CadastroClientePage() {
  const [state, formAction, pending] = useActionState(cadastroClienteAction, initialState);

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

        <h1 className="mt-6 text-xl font-bold text-slate-900">Criar conta de anunciante</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monte seu plano escolhendo as telas onde sua marca vai aparecer.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
              Nome ou empresa
            </label>
            <input
              id="nome"
              name="nome"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-slate-700">
                Telefone
              </label>
              <input
                id="telefone"
                name="telefone"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-slate-700">
                Cidade
              </label>
              <input
                id="cidade"
                name="cidade"
                defaultValue="João Pessoa"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
              Senha
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
            {pending ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-telas-blue hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
