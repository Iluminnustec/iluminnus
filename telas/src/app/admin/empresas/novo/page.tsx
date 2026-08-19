"use client";

import { useActionState } from "react";
import { createEmpresa, type EmpresaState } from "../../actions";
import { PasswordInput } from "@/components/password-input";

const initialState: EmpresaState = {};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-iluminnus-navy focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700";

export default function NovaEmpresaPage() {
  const [state, formAction, pending] = useActionState(createEmpresa, initialState);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Nova empresa</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cadastra o dono, a assinatura mensal e o primeiro usuário administrador dele.
      </p>

      <form action={formAction} className="mt-6 max-w-lg space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-900">Empresa</legend>

          <div>
            <label htmlFor="nome" className={labelClass}>
              Nome *
            </label>
            <input id="nome" name="nome" required className={inputClass} />
          </div>

          <div>
            <label htmlFor="dominio" className={labelClass}>
              Domínio
            </label>
            <input
              id="dominio"
              name="dominio"
              placeholder="ex: empresa.com.br"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Sem o https:// — deixe em branco se ainda não tiver domínio próprio.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cidade" className={labelClass}>
                Cidade
              </label>
              <input id="cidade" name="cidade" className={inputClass} />
            </div>
            <div>
              <label htmlFor="estado" className={labelClass}>
                Estado
              </label>
              <input id="estado" name="estado" maxLength={2} className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-slate-200 pt-4">
          <legend className="text-sm font-semibold text-slate-900">Assinatura</legend>

          <div>
            <label htmlFor="plano" className={labelClass}>
              Plano *
            </label>
            <input id="plano" name="plano" required defaultValue="Padrão" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="valorMensal" className={labelClass}>
                Valor mensal (R$) *
              </label>
              <input
                id="valorMensal"
                name="valorMensal"
                type="number"
                step="0.01"
                min="0"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="diaVencimento" className={labelClass}>
                Dia do vencimento *
              </label>
              <input
                id="diaVencimento"
                name="diaVencimento"
                type="number"
                min="1"
                max="28"
                required
                defaultValue={5}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-slate-200 pt-4">
          <legend className="text-sm font-semibold text-slate-900">
            Primeiro usuário (administrador do dono)
          </legend>

          <div>
            <label htmlFor="adminNome" className={labelClass}>
              Nome *
            </label>
            <input id="adminNome" name="adminNome" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="adminEmail" className={labelClass}>
              E-mail *
            </label>
            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="adminSenha" className={labelClass}>
              Senha inicial *
            </label>
            <PasswordInput
              id="adminSenha"
              name="adminSenha"
              minLength={8}
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Mínimo de 8 caracteres. Combine com o dono e recomende trocar no primeiro acesso.
            </p>
          </div>
        </fieldset>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-iluminnus-navy px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar empresa"}
        </button>
      </form>
    </div>
  );
}
