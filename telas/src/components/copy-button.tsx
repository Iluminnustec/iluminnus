"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
    >
      {copiado ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-600" /> Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Copiar
        </>
      )}
    </button>
  );
}
