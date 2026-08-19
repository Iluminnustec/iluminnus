"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { criarContaTelas, type AssinarState } from "./actions";
import { PasswordInput } from "@/components/password-input";

const initialState: AssinarState = {};

export function AssinarForm({
  codigoRef,
  indicadorNome,
  origem,
}: {
  codigoRef?: string;
  indicadorNome?: string | null;
  origem?: string;
}) {
  const [state, formAction, pending] = useActionState(criarContaTelas, initialState);
  const marcaIluminnus = origem === "iluminnus";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={marcaIluminnus ? "/brand/logo-iluminnus.jpg" : "/brand/telas-icon.png"}
            alt={marcaIluminnus ? "Iluminnus" : "Telas"}
            width={32}
            height={32}
            className={marcaIluminnus ? "h-8 w-8 rounded-md object-cover" : "h-8 w-8"}
          />
          <span className="text-lg font-semibold text-slate-900">
            {marcaIluminnus ? "Iluminnus" : "Telas"}
          </span>
        </Link>

        <h1 className="mt-6 text-xl font-bold text-slate-900">
          {marcaIluminnus ? "Seja cliente Iluminnus" : "Assine o Telas"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          14 dias de teste grátis. Sem cartão de crédito agora.
        </p>

        {indicadorNome && (
          <p className="mt-3 rounded-md bg-telas-blue/10 px-3 py-2 text-xs font-medium text-telas-navy">
            Indicado por {indicadorNome}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          {codigoRef && <input type="hidden" name="ref" value={codigoRef} />}

          <div>
            <label htmlFor="empresaNome" className="block text-sm font-medium text-slate-700">
              Nome da empresa
            </label>
            <input
              id="empresaNome"
              name="empresaNome"
              required
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
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
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
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
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
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="adminSenha" className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <PasswordInput
              id="adminSenha"
              name="adminSenha"
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
            {pending ? "Criando conta..." : "Começar teste grátis"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link
            href={marcaIluminnus ? "/login?origem=iluminnus" : "/login"}
            className="font-medium text-telas-blue hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
