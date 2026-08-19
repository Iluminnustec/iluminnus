import { CalendarClock, CreditCard, Wallet, PlayCircle, Video, RefreshCw, Repeat } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/brand";

const planos = [
  {
    telas: 5,
    preco: "680",
    porTela: "136,00",
    destaque: false,
    tag: null,
    descricao: "Presença direcionada.",
  },
  {
    telas: 10,
    preco: "1.090",
    porTela: "109,00",
    destaque: false,
    tag: null,
    descricao: "Mais alcance e frequência.",
  },
  {
    telas: 15,
    preco: "1.390",
    porTela: "92,67",
    destaque: true,
    tag: "Mais escolhido",
    descricao: "Melhor custo-benefício: maior presença da marca com investimento otimizado.",
  },
  {
    telas: 20,
    preco: "1.790",
    porTela: "89,50",
    destaque: false,
    tag: null,
    descricao: "Máxima cobertura da rede Telas.",
  },
];

const exibicoes = [
  { telas: 5, dia: "570", mes: "17.100", tresMeses: "51.300" },
  { telas: 10, dia: "1.140", mes: "34.200", tresMeses: "102.600" },
  { telas: 15, dia: "1.710", mes: "51.300", tresMeses: "153.900" },
  { telas: 20, dia: "2.280", mes: "68.400", tresMeses: "205.200" },
];

const comoFunciona = [
  { n: 1, title: "Escolha seu pacote", description: "Escolha entre 5, 10, 15 ou 20 telas." },
  { n: 2, title: "Assine o contrato", description: "Contrato com duração mínima de 3 meses." },
  { n: 3, title: "Pague a 1ª mensalidade", description: "Pagamento mensal nas formas disponíveis." },
  { n: 4, title: "Envie os 2 vídeos", description: "Você pode alterar seus vídeos a cada 10 dias, até 3x por mês." },
  { n: 5, title: "Campanha no ar", description: "Seus vídeos passam a ser veiculados em todas as telas do pacote." },
  { n: 6, title: "Início dos 3 meses", description: "A contagem do contrato começa somente quando seus vídeos entram em veiculação." },
];

const condicoes = [
  { title: "Contrato de 3 meses", description: "Contrato com prazo mínimo de 3 meses.", icon: CalendarClock },
  { title: "Pagamento mensal", description: "O pagamento é mensal. Você não precisa pagar os 3 meses antecipados.", icon: Wallet },
  { title: "Formas de pagamento", description: "PIX, cartão de crédito ou débito em conta.", icon: CreditCard },
  { title: "Início da vigência", description: "A contagem dos 3 meses começa somente na data em que os vídeos entrarem em veiculação.", icon: PlayCircle },
  { title: "Vídeos fornecidos pelo anunciante", description: "Os 2 vídeos de 15 segundos são produzidos pelo anunciante e entregues prontos para veiculação.", icon: Video },
  { title: "Atualização dos vídeos", description: "Você pode modificar seus vídeos a cada 10 dias, até 3 vezes por mês.", icon: RefreshCw },
  { title: "Renovação", description: "Ao final dos 3 meses, entramos em contato para saber se você tem interesse em renovar sua campanha.", icon: Repeat },
];

export default function PlanosPage() {
  return (
    <div>
      <section className="bg-telas-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-telas-bronze">
            Planos e preços
          </p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Sua marca em movimento, números que geram impacto.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Contrato de 3 meses, pagamento mensal. Todos os planos incluem 2
            vídeos de 15 segundos em veiculação recorrente em todas as telas
            do pacote.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {planos.map((plano) => (
            <div
              key={plano.telas}
              className={`relative rounded-xl border p-6 transition-all hover:-translate-y-1 ${
                plano.destaque
                  ? "border-telas-bronze bg-white shadow-lg ring-1 ring-telas-bronze"
                  : "border-slate-200 bg-white hover:shadow-lg hover:shadow-telas-blue/10"
              }`}
            >
              {plano.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-telas-bronze px-3 py-1 text-xs font-semibold text-white">
                  ★ {plano.tag}
                </span>
              )}
              <p className="text-sm font-semibold text-slate-500">{plano.telas} TELAS</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                R$ {plano.preco}
                <span className="text-base font-medium text-slate-500">/mês</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">R$ {plano.porTela} por tela</p>
              <p className="mt-4 text-sm text-slate-600">{plano.descricao}</p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 block rounded-md px-4 py-2 text-center text-sm font-semibold ${
                  plano.destaque
                    ? "bg-telas-bronze text-white hover:brightness-110"
                    : "bg-telas-navy text-white hover:bg-telas-navy-light"
                }`}
              >
                Quero esse plano
              </a>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Todos os planos incluem 2 vídeos de 15 segundos em veiculação
          recorrente em todas as telas do pacote.
        </p>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900">
            Números que geram impacto
          </h2>
          <p className="mt-2 text-slate-600">
            Veja quantas exibições sua marca terá todos os dias, por mês e em
            3 meses em cada pacote (telas ligadas das 5h à 0h, 19 horas por
            dia).
          </p>

          <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Pacote</th>
                  <th className="px-4 py-3">Exibições por dia</th>
                  <th className="px-4 py-3">Exibições por mês</th>
                  <th className="px-4 py-3">Exibições em 3 meses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exibicoes.map((row) => (
                  <tr key={row.telas}>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.telas} telas</td>
                    <td className="px-4 py-3 text-telas-bronze font-semibold">{row.dia}</td>
                    <td className="px-4 py-3 text-telas-bronze font-semibold">{row.mes}</td>
                    <td className="px-4 py-3 text-telas-bronze font-semibold">{row.tresMeses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Cada exibição corresponde à reprodução dos 2 vídeos do cliente em
            1 tela. Os números representam o total de exibições em todas as
            telas contratadas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900">É simples anunciar com a Telas</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comoFunciona.map((step) => (
            <div
              key={step.n}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-telas-blue/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-telas-bronze text-sm font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900">Condições comerciais</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {condicoes.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-telas-blue/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-telas-navy text-telas-blue">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Leve sua marca ainda mais longe.
        </h2>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-md bg-telas-bronze px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
        >
          Fale com a gente no WhatsApp
        </a>
      </section>
    </div>
  );
}
