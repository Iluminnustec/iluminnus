import Link from "next/link";
import Image from "next/image";
import { WHATSAPP_LINK } from "@/lib/brand";

const links = [
  { href: "/", label: "Início" },
  { href: "/planos", label: "Planos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/telas-icon.png"
            alt="Telas"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            <span className="text-telas-bronze">Telas</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-telas-navy-light">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md bg-telas-bronze px-4 py-2 text-sm font-semibold text-white hover:brightness-110 sm:inline-block"
          >
            Fale conosco
          </a>
          <Link
            href="/cliente/login"
            className="rounded-md bg-telas-navy px-4 py-2 text-sm font-medium text-white hover:bg-telas-navy-light"
          >
            Área do cliente
          </Link>
        </div>
      </div>
    </header>
  );
}
