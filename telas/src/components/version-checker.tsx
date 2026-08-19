"use client";

import { useEffect, useState } from "react";
import { APP_VERSION } from "@/lib/version";

export function VersionChecker({ className = "" }: { className?: string }) {
  const [novaVersao, setNovaVersao] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function checar() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const data = await res.json();
        if (ativo && data.version && data.version !== APP_VERSION) {
          setNovaVersao(true);
        }
      } catch {
        // sem conexão ou rota indisponível: ignora silenciosamente
      }
    }

    checar();
    const interval = setInterval(checar, 60_000);
    window.addEventListener("focus", checar);

    return () => {
      ativo = false;
      clearInterval(interval);
      window.removeEventListener("focus", checar);
    };
  }, []);

  if (!novaVersao) return null;

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className={`rounded bg-brivox-bronze px-2 py-0.5 text-[10px] font-semibold text-white hover:brightness-110 ${className}`}
    >
      Nova versão · Atualizar
    </button>
  );
}
