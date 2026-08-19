import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/painel/actions";
import { VersionBadge } from "@/components/version-badge";
import { UserMenu } from "@/components/user-menu";
import { AdminSidebarNav } from "@/components/admin-sidebar-nav";
import { MobileAdminNav } from "@/components/mobile-admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-iluminnus-navy sm:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
            <Image
              src="/brand/logo-iluminnus.jpg"
              alt="Iluminnus"
              fill
              className="object-cover object-top"
            />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Iluminnus</p>
            <p className="text-xs leading-tight text-iluminnus-gold">Administração</p>
          </div>
        </div>

        <AdminSidebarNav />

        <div className="border-t border-white/10 px-5 py-4">
          <VersionBadge className="text-slate-500" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-2 sm:hidden">
            <MobileAdminNav />
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
              <Image
                src="/brand/logo-iluminnus.jpg"
                alt="Iluminnus"
                fill
                className="object-cover object-top"
              />
            </div>
            <span className="text-base font-semibold text-slate-900">Iluminnus</span>
          </div>
          <div className="hidden sm:block" />
          <UserMenu
            nome={session.nome}
            email={session.email}
            onLogout={logoutAction}
            senhaHref="/admin/senha"
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
