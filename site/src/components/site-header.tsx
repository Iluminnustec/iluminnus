import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#produtos", label: "Produtos" },
  { href: "#contato", label: "Contato" },
];

// Trocar quando o Telas tiver domínio próprio (ex: telas.iluminnus.com.br).
const TELAS_LOGIN_URL =
  process.env.NEXT_PUBLIC_TELAS_URL ?? "https://telas-blond.vercel.app/login";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo-vertical.jpg"
            alt="Iluminnus Technology"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="text-sm font-semibold tracking-[0.2em] text-foreground">
            ILUMINNUS
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden gap-8 text-sm text-muted sm:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-gold-bright"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={TELAS_LOGIN_URL}
            className="rounded-full border border-gold/40 px-4 py-1.5 text-sm font-medium text-gold-bright transition-colors hover:bg-gold/10"
          >
            Entrar
          </a>
        </div>
      </div>
    </header>
  );
}
