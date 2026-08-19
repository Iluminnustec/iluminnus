import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getClienteSession } from "@/lib/auth-cliente";
import { logoutClienteAction } from "../actions";
import { prisma } from "@/lib/prisma";
import { empresaBloqueada } from "@/lib/assinatura";

export default async function AreaClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getClienteSession();
  if (!session) redirect("/cliente/login");

  const empresa = await prisma.empresa.findUnique({
    where: { id: session.empresaId },
    select: { ativo: true, assinatura: { select: { status: true } } },
  });
  if (!empresa || empresaBloqueada(empresa)) {
    redirect("/cliente-bloqueado");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/cliente/plano" className="flex items-center gap-2">
            <Image
              src="/brand/telas-icon.png"
              alt="Telas"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-base font-semibold text-slate-900">Telas</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <Link href="/cliente/plano" className="hover:text-brivox-navy-light">
              Montar plano
            </Link>
            <Link href="/cliente/propostas" className="hover:text-brivox-navy-light">
              Minhas propostas
            </Link>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span className="hidden text-slate-500 sm:inline">{session.nome}</span>
            <form action={logoutClienteAction}>
              <button type="submit" className="text-slate-500 hover:text-red-600">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
