import Image from "next/image";
import Link from "next/link";
import { Eye, Target, MapPin, TrendingUp, MonitorPlay, ArrowUpDown, Rows3 } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/brand";

const pilares = [
  { title: "Alta visibilidade", description: "Sua marca sempre em foco.", icon: Eye },
  { title: "Público qualificado", description: "Mensagens que impactam de verdade.", icon: Target },
  { title: "Presença estratégica", description: "Comunicação no momento certo.", icon: MapPin },
  { title: "Mais resultados", description: "Engajamento e conversão.", icon: TrendingUp },
];

const formatos = [
  {
    title: "Totem vertical 55\"",
    description: "Impacto na recepção e circulação dos empreendimentos.",
    spec: "55 polegadas",
    icon: Rows3,
  },
  {
    title: "Tela vertical 19\" no elevador",
    description: "Atenção garantida todos os dias, perto de quem importa.",
    spec: "19 polegadas",
    icon: ArrowUpDown,
  },
  {
    title: "Tela horizontal",
    description: "Para halls e estabelecimentos, em formato widescreen.",
    spec: "Widescreen",
    icon: MonitorPlay,
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brivox-navy text-white">
        {/* Gradiente escuro (canto superior esquerdo) para azul mais vivo (inferior direito) */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 88% 90%, #2148c9 0%, #123785 32%, #0a1f52 58%, #00142f 100%)",
          }}
        />
        {/* Vinheta sutil pra garantir contraste do texto na esquerda */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(0,10,30,0.65) 0%, rgba(0,10,30,0.25) 45%, rgba(0,10,30,0) 65%)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <Image
              src="/brand/telas-icon.png"
              alt="Telas"
              width={56}
              height={56}
              className="h-12 w-12"
            />

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-300">
                Rede de telas conectada em tempo real
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Sua marca em movimento,
              <br />
              <span className="text-brivox-bronze">o tempo todo.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Mídia indoor que aproxima, informa e gera resultados — em
              empreendimentos de alto padrão de João Pessoa.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-brivox-bronze px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brivox-bronze/20 hover:brightness-110"
              >
                Fale conosco
              </a>
              <Link
                href="/planos"
                className="rounded-md border border-slate-600 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver planos e preços
              </Link>
            </div>
          </div>

          <div className="hidden flex-col items-center justify-center lg:flex">
            <Image
              src="/brand/telas-logo-full.png"
              alt="Telas"
              width={280}
              height={280}
              className="h-auto w-full max-w-[220px] drop-shadow-[0_0_40px_rgba(65,105,225,0.35)]"
            />
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
              Presença que conecta. Impacto que fica.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-brivox-blue">
          Vantagens
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Por que anunciar com a Telas
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pilares.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brivox-blue/40 hover:shadow-lg hover:shadow-brivox-blue/10"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brivox-blue to-brivox-bronze transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brivox-navy text-brivox-blue transition-colors group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-xs text-slate-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-50">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-brivox-blue">
            Formatos
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Formatos disponíveis
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {formatos.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brivox-blue/10"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brivox-navy text-brivox-blue transition-colors group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="mt-4 inline-block w-fit rounded-full bg-brivox-blue/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-brivox-blue">
                    {item.spec}
                  </span>
                  <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Sua marca vista, lembrada e escolhida.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Conheça os pacotes de telas disponíveis e o investimento mensal
          para colocar sua marca em movimento.
        </p>
        <Link
          href="/planos"
          className="mt-8 inline-block rounded-md bg-brivox-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brivox-navy-light"
        >
          Ver planos e preços
        </Link>
      </section>
    </div>
  );
}
