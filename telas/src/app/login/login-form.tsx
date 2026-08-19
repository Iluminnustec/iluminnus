"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginAction, type LoginState } from "./actions";
import { PasswordInput } from "@/components/password-input";

const initialState: LoginState = {};

export function LoginForm({ origem }: { origem?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const marcaIluminnus = origem === "iluminnus";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
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

        <h1 className="mt-6 text-xl font-bold text-slate-900">Entrar</h1>

        <form action={formAction} className="mt-6 space-y-4">
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

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <PasswordInput
              id="senha"
              name="senha"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-telas-navy px-4 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Ainda não tem conta?{" "}
          <Link
            href={marcaIluminnus ? "/assinar?origem=iluminnus" : "/assinar"}
            className="font-medium text-telas-blue hover:underline"
          >
            Assine o Telas
          </Link>
        </p>
      </div>
    </div>
  );
}
