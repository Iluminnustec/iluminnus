const PILARES = [
  {
    titulo: "Software próprio",
    descricao:
      "Cada produto é desenhado, desenvolvido e mantido internamente pela Iluminnus — do primeiro rascunho ao suporte contínuo.",
  },
  {
    titulo: "Assinatura mensal",
    descricao:
      "Empresas contratam nossos sistemas como serviço: sem custo de licença única, sem infraestrutura própria para manter.",
  },
  {
    titulo: "Gestão centralizada",
    descricao:
      "Toda a operação dos nossos produtos — clientes, cobrança, suporte — é acompanhada de perto por um único time.",
  },
];

export function Sobre() {
  return (
    <section id="sobre" className="border-t border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold tracking-[0.3em] text-gold uppercase">
            Sobre a Iluminnus
          </h2>
          <p className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
            Uma empresa de tecnologia que constrói e opera os próprios
            produtos.
          </p>
          <p className="mt-4 text-muted">
            A Iluminnus nasceu para desenvolver sistemas de gestão sob
            medida e entregá-los como assinatura — cuidando de tudo, desde o
            código até o relacionamento com cada cliente que usa nossos
            produtos no dia a dia.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PILARES.map((pilar) => (
            <div
              key={pilar.titulo}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {pilar.titulo}
              </h3>
              <p className="mt-2 text-sm text-muted">{pilar.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
