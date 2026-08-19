import Image from "next/image";

export function Hero() {
  return (
    <section className="bg-radial-glow relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-24 pt-20 text-center sm:pt-28">
        <Image
          src="/brand/logo-vertical.jpg"
          alt="Iluminnus Technology"
          width={120}
          height={150}
          priority
          className="rounded-2xl shadow-[0_0_60px_rgba(212,175,106,0.25)]"
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            <span className="text-gradient-gold">Iluminnus</span>{" "}
            <span className="text-foreground">Technology</span>
          </h1>
          <p className="text-blue-bright text-sm font-medium tracking-[0.35em] uppercase">
            Software próprio, gerido de ponta a ponta
          </p>
        </div>
        <p className="max-w-2xl text-balance text-lg text-muted">
          Criamos e operamos uma linha de sistemas próprios, vendidos por
          assinatura mensal para empresas que precisam de tecnologia sob
          medida — sem depender de fornecedores externos.
        </p>
        <a
          href="#produtos"
          className="rounded-full bg-gradient-to-r from-gold to-gold-bright px-7 py-3 text-sm font-semibold text-[#1a1305] transition-transform hover:scale-105"
        >
          Conhecer os produtos
        </a>
      </div>
    </section>
  );
}
