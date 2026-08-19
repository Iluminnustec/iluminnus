"use client";

import { useActionState, useState } from "react";
import type { PredioState } from "./actions";

type PredioFormAction = (state: PredioState, formData: FormData) => Promise<PredioState>;

type PredioFormProps = {
  action: PredioFormAction;
  defaultValues?: {
    nome?: string;
    endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    sindicoNome?: string | null;
    sindicoContato?: string | null;
    observacoes?: string | null;
  };
  submitLabel: string;
};

const initialState: PredioState = {};

export function PredioForm({ action, defaultValues, submitLabel }: PredioFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [buscando, setBuscando] = useState(false);
  const [buscaErro, setBuscaErro] = useState("");
  const [buscaAviso, setBuscaAviso] = useState("");

  async function buscarCoordenadas() {
    const endereco = (document.getElementById("endereco") as HTMLInputElement)?.value ?? "";
    const bairro = (document.getElementById("bairro") as HTMLInputElement)?.value ?? "";
    const cidade = (document.getElementById("cidade") as HTMLInputElement)?.value || "João Pessoa";
    const estado = (document.getElementById("estado") as HTMLInputElement)?.value || "PB";

    if (!endereco && !bairro) {
      setBuscaErro("Preencha ao menos o endereço ou o bairro para buscar.");
      return;
    }

    setBuscando(true);
    setBuscaErro("");
    setBuscaAviso("");
    try {
      const params = new URLSearchParams({ endereco, bairro, cidade, estado });
      const res = await fetch(`/api/geocode?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setBuscaErro(data.error ?? "Não foi possível encontrar o endereço.");
        return;
      }
      (document.getElementById("latitude") as HTMLInputElement).value = data.latitude.toFixed(6);
      (document.getElementById("longitude") as HTMLInputElement).value = data.longitude.toFixed(6);
      if (data.aproximado) {
        setBuscaAviso(
          "Endereço exato não encontrado no mapa — usamos uma localização aproximada (bairro/cidade). Ajuste manualmente se precisar de mais precisão."
        );
      }
    } catch {
      setBuscaErro("Falha ao buscar coordenadas. Tente novamente.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-4">
      <Field label="Nome do prédio *" name="nome" defaultValue={defaultValues?.nome} required />
      <Field label="Endereço" name="endereco" defaultValue={defaultValues?.endereco ?? ""} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Bairro" name="bairro" defaultValue={defaultValues?.bairro ?? ""} />
        <Field label="Cidade" name="cidade" defaultValue={defaultValues?.cidade ?? "João Pessoa"} />
        <Field label="Estado" name="estado" defaultValue={defaultValues?.estado ?? "PB"} />
      </div>

      <Field label="CEP" name="cep" defaultValue={defaultValues?.cep ?? ""} />

      <div>
        <button
          type="button"
          onClick={buscarCoordenadas}
          disabled={buscando}
          className="rounded-md border border-brivox-navy px-3 py-1.5 text-xs font-semibold text-brivox-navy hover:bg-brivox-navy hover:text-white disabled:opacity-60"
        >
          {buscando ? "Buscando..." : "Buscar coordenadas pelo endereço"}
        </button>
        {buscaErro && <p className="mt-1 text-xs text-red-600">{buscaErro}</p>}
        {buscaAviso && <p className="mt-1 text-xs text-amber-600">{buscaAviso}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Latitude"
          name="latitude"
          defaultValue={defaultValues?.latitude?.toString() ?? ""}
        />
        <Field
          label="Longitude"
          name="longitude"
          defaultValue={defaultValues?.longitude?.toString() ?? ""}
        />
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        Opcional — usado para mostrar o prédio no mapa do dashboard. Clique em
        &quot;Buscar coordenadas&quot; ou preencha manualmente.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Síndico / Administradora" name="sindicoNome" defaultValue={defaultValues?.sindicoNome ?? ""} />
        <Field label="Contato do síndico" name="sindicoContato" defaultValue={defaultValues?.sindicoContato ?? ""} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Observações</label>
        <textarea
          name="observacoes"
          defaultValue={defaultValues?.observacoes ?? ""}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brivox-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brivox-navy-light disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brivox-blue focus:outline-none"
      />
    </div>
  );
}
