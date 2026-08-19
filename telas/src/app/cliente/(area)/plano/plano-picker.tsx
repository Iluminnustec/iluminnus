"use client";

import { useActionState, useMemo, useState } from "react";
import { enviarPropostaAction, type PropostaState } from "../../actions";

type Opcao = {
  id: string;
  nome: string;
  predioNome: string;
  predioLocal: string;
  label: string;
  badge: string;
  ocupacao: number;
  capacidade: number;
  precoAtual: number;
};

const initialState: PropostaState = {};

export function PlanoPicker({ opcoes }: { opcoes: Opcao[] }) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [state, formAction, pending] = useActionState(enviarPropostaAction, initialState);

  function alternar(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const total = useMemo(
    () =>
      opcoes
        .filter((opcao) => selecionadas.has(opcao.id))
        .reduce((soma, opcao) => soma + opcao.precoAtual, 0),
    [opcoes, selecionadas]
  );

  const porPredio = useMemo(() => {
    const grupos = new Map<string, Opcao[]>();
    for (const opcao of opcoes) {
      const chave = `${opcao.predioNome}__${opcao.predioLocal}`;
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave)!.push(opcao);
    }
    return [...grupos.entries()];
  }, [opcoes]);

  return (
    <form action={formAction} className="mt-8 pb-28">
      <div className="space-y-6">
        {porPredio.map(([chave, itens]) => {
          const [predioNome, predioLocal] = chave.split("__");
          return (
            <div key={chave} className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900">{predioNome}</h2>
              {predioLocal && <p className="text-xs text-slate-400">{predioLocal}</p>}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {itens.map((opcao) => {
                  const marcada = selecionadas.has(opcao.id);
                  return (
                    <label
                      key={opcao.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                        marcada
                          ? "border-telas-blue bg-telas-blue/5"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="telaIds"
                        value={opcao.id}
                        checked={marcada}
                        onChange={() => alternar(opcao.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-900">{opcao.nome}</span>
                          <span className="text-sm font-semibold text-slate-900">
                            R$ {opcao.precoAtual.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <span
                          className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${opcao.badge}`}
                        >
                          {opcao.label} · {opcao.ocupacao}/{opcao.capacidade}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        {opcoes.length === 0 && (
          <p className="text-sm text-slate-400">Nenhuma tela disponível no momento.</p>
        )}
      </div>

      {state.error && <p className="mt-4 text-sm text-red-600">{state.error}</p>}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs text-slate-500">{selecionadas.size} tela(s) selecionada(s)</p>
            <p className="text-lg font-bold text-slate-900">
              R$ {total.toFixed(2).replace(".", ",")}
              <span className="text-sm font-normal text-slate-500">/mês</span>
            </p>
          </div>
          <button
            type="submit"
            disabled={pending || selecionadas.size === 0}
            className="rounded-md bg-telas-navy px-6 py-3 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-50"
          >
            {pending ? "Enviando..." : "Enviar proposta"}
          </button>
        </div>
      </div>
    </form>
  );
}
