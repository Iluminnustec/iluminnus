import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "./actions";
import { VersionBadge } from "@/components/version-badge";
import { VersionChecker } from "@/components/version-checker";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobilePainelNav } from "@/components/mobile-painel-nav";
import { UserMenu } from "@/components/user-menu";
import { prisma } from "@/lib/prisma";
import { empresaBloqueada } from "@/lib/assinatura";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.empresaId) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: session.empresaId },
      select: { ativo: true, assinatura: { select: { status: true } } },
    });
    if (!empresa || empresaBloqueada(empresa)) {
      redirect("/painel-bloqueado");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-brivox-navy sm:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Image
            src="/brand/telas-icon.png"
            alt="Telas"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Telas</p>
            <p className="text-xs leading-tight text-slate-400">Painel</p>
          </div>
        </div>

        <SidebarNav cargo={session.cargo} />

        <div className="border-t border-white/10 px-5 py-4">
          <VersionBadge className="text-slate-500" />
          <VersionChecker className="mt-1 block" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2 sm:hidden">
            <MobilePainelNav cargo={session.cargo} />
            <Image
              src="/brand/telas-icon.png"
              alt="Telas"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-base font-semibold text-slate-900">Telas</span>
          </div>
          <div className="hidden sm:block" />
          <UserMenu nome={session.nome} email={session.email} onLogout={logoutAction} />
        </header>
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
