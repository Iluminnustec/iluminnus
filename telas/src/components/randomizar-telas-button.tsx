"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { randomizarTelasCliente } from "@/app/painel/midia/actions";

export function RandomizarTelasButton({ clienteId }: { clienteId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const resultado = await randomizarTelasCliente(clienteId);
      setError(resultado.error ?? null);
      if (!resultado.error) router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        title="Sorteia as telas do pacote do cliente e aplica em todas as mídias dele"
        className="rounded border border-telas-blue px-2 py-1 text-[11px] font-medium text-telas-blue hover:bg-telas-blue/5 disabled:opacity-50"
      >
        {pending ? "Sorteando..." : "🎲 Randomizar"}
      </button>
      {error && <p className="mt-1 max-w-[220px] text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
