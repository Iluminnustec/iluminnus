type Produto = {
  nome: string;
  status: "Disponível" | "Em breve";
  descricao: string;
  destaques: string[];
};

const PRODUTOS: Produto[] = [
  {
    nome: "Telas",
    status: "Disponível",
    descricao:
      "Gestão de mídia indoor: transforma TVs instaladas em prédios e estabelecimentos em telas de publicidade gerenciadas à distância.",
    destaques: [
      "Painel de conteúdo por tela, prédio e dispositivo",
      "Player próprio para Android nas telas físicas",
      "Portal para clientes acompanharem seus anúncios",
    ],
  },
];

export function Produtos() {
  return (
    <section id="produtos" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-sm font-semibold tracking-[0.3em] text-gold uppercase">
          Produtos
        </h2>
        <p className="mt-4 max-w-2xl text-3xl font-semibold text-foreground sm:text-4xl">
          Sistemas prontos para assinar.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PRODUTOS.map((produto) => (
            <div
              key={produto.nome}
              className="rounded-2xl border border-border bg-surface p-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground">
                  {produto.nome}
                </h3>
                <span className="rounded-full border border-blue/40 bg-blue/10 px-3 py-1 text-xs font-medium text-blue-bright">
                  {produto.status}
                </span>
              </div>
              <p className="mt-3 text-muted">{produto.descricao}</p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                {produto.destaques.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-gold">＋</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col justify-center rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            <p className="text-sm">Próximo produto em construção.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
