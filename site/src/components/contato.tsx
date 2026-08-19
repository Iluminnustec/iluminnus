export function Contato() {
  return (
    <section id="contato" className="border-t border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-sm font-semibold tracking-[0.3em] text-gold uppercase">
          Contato
        </h2>
        <p className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
          Quer assinar um dos nossos produtos?
        </p>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Fale com a gente para conhecer os planos.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:contato@iluminnus.com.br"
            className="rounded-full bg-gradient-to-r from-gold to-gold-bright px-7 py-3 text-sm font-semibold text-[#1a1305] transition-transform hover:scale-105"
          >
            contato@iluminnus.com.br
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">
          (e-mail provisório — atualizar com o contato oficial)
        </p>
      </div>
    </section>
  );
}
