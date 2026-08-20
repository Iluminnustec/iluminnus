"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function ReferralLinkBanner({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);
  const podeCompartilhar =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão de clipboard -- o link continua selecionável no texto
    }
  }

  async function compartilhar() {
    try {
      await navigator.share({ title: "Cadastro Telas", url: link });
    } catch {
      // usuário cancelou o share sheet -- sem problema
    }
  }

  return (
    <div className="sticky top-0 z-10 mt-4 rounded-lg border border-telas-blue/30 bg-telas-blue/5 px-4 py-3 text-sm shadow-sm backdrop-blur-sm">
      <p className="font-medium text-slate-700">Seu link de indicação</p>
      <p className="mt-1 break-all text-slate-600">
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-telas-navy">{link}</code>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copiar}
          className="flex items-center gap-1.5 rounded-md border border-telas-blue/40 bg-white px-3 py-1.5 text-xs font-medium text-telas-navy hover:bg-telas-blue/10"
        >
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiado ? "Copiado!" : "Copiar"}
        </button>
        {podeCompartilhar && (
          <button
            type="button"
            onClick={compartilhar}
            className="flex items-center gap-1.5 rounded-md border border-telas-blue/40 bg-white px-3 py-1.5 text-xs font-medium text-telas-navy hover:bg-telas-blue/10"
          >
            <Share2 className="h-3.5 w-3.5" />
            Compartilhar
          </button>
        )}
      </div>
    </div>
  );
}
