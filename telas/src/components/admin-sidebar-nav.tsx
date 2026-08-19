"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Wallet, LayoutGrid, Users } from "lucide-react";

const items = [
  { href: "/admin", label: "Empresas", icon: Building2 },
  { href: "/admin/apps", label: "Apps e licenças", icon: LayoutGrid },
  { href: "/admin/indicadores", label: "Indicadores", icon: Users },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3">
      {items.map((item) => {
        const ativo =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              ativo
                ? "bg-iluminnus-gold/15 text-iluminnus-gold-bright"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
