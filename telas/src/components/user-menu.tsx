"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, KeyRound, ExternalLink } from "lucide-react";

type UserMenuProps = {
  nome: string;
  email: string;
  onLogout: () => void;
  senhaHref?: string;
};

export function UserMenu({ nome, email, onLogout, senhaHref = "/painel/senha" }: UserMenuProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", onClickFora);
    return () => document.removeEventListener("mousedown", onClickFora);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-telas-bronze text-sm font-semibold text-white hover:brightness-110"
        aria-label="Menu da conta"
      >
        {inicial}
      </button>

      {aberto && (
        <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{nome}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>

          <nav className="py-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => setAberto(false)}
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              Ir para o site
            </Link>
            <Link
              href={senhaHref}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => setAberto(false)}
            >
              <KeyRound className="h-4 w-4 text-slate-400" />
              Alterar senha
            </Link>
          </nav>

          <div className="border-t border-slate-100 py-1">
            <form action={onLogout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
