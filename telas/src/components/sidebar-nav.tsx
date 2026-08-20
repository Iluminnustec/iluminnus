"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MonitorPlay,
  Users,
  Receipt,
  Wallet,
  Package,
  UserCog,
  History,
  Clapperboard,
  Tv,
  Percent,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { podeAcessar, type Cargo } from "@/lib/rbac";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  { items: [{ href: "/painel", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Operação",
    items: [
      { href: "/painel/predios", label: "Prédios", icon: Building2 },
      { href: "/painel/telas", label: "Telas", icon: MonitorPlay },
      { href: "/painel/midia", label: "Mídia", icon: Clapperboard },
      { href: "/painel/dispositivos", label: "Dispositivos", icon: Tv },
    ],
  },
  {
    label: "Comercial",
    items: [
      { href: "/painel/clientes", label: "Clientes", icon: Users },
      { href: "/painel/solicitacoes", label: "Solicitações", icon: ClipboardCheck },
      { href: "/painel/receitas", label: "Receitas", icon: Receipt },
      { href: "/painel/propostas", label: "Propostas", icon: FileText },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/painel/despesas", label: "Despesas", icon: Wallet },
      { href: "/painel/comissoes", label: "Comissões", icon: Percent },
      { href: "/painel/estoque", label: "Estoque", icon: Package },
    ],
  },
  {
    label: "Administração",
    items: [
      { href: "/painel/usuarios", label: "Usuários", icon: UserCog },
      { href: "/painel/atividades", label: "Atividades", icon: History },
    ],
  },
];

export function SidebarNav({ cargo }: { cargo: Cargo }) {
  const pathname = usePathname();

  const groupsVisiveis = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => podeAcessar(cargo, item.href)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav className="flex-1 space-y-5 px-3">
      {groupsVisiveis.map((group, i) => (
        <div key={i}>
          {group.label && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const ativo =
                item.href === "/painel"
                  ? pathname === "/painel"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    ativo
                      ? "bg-telas-bronze/15 text-telas-bronze"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
