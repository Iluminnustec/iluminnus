"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import type { Cargo } from "@/lib/rbac";

export function MobilePainelNav({ cargo }: { cargo: Cargo }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 sm:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col overflow-y-auto bg-brivox-navy pb-6 shadow-xl">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2">
                <Image
                  src="/brand/logo-icon.png"
                  alt="Brivox Mídia"
                  width={28}
                  height={36}
                  className="h-7 w-auto"
                />
                <div>
                  <p className="text-sm font-semibold leading-tight text-white">Brivox</p>
                  <p className="text-xs leading-tight text-slate-400">Painel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav cargo={cargo} />
          </div>
        </div>
      )}
    </>
  );
}
