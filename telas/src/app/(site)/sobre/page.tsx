import { Building2, Users, MonitorPlay, ShieldCheck } from "lucide-react";

const numeros = [
  { label: "Empreendimentos", value: "+15", icon: Building2 },
  { label: "Telas na rede", value: "+30", icon: MonitorPlay },
  { label: "Marcas atendidas", value: "+40", icon: Users },
];

const valores = [
  {
    title: "Locais bem selecionados",
    description:
      "Telas instaladas em pontos de alto fluxo — recepções, elevadores e áreas de circulação de empreendimentos de alto padrão.",
    icon: Building2,
  },
  {
    title: "Gestão próxima",
    description:
      "Acompanhamento direto com cada parceiro e anunciante, do início da campanha à renovação do contrato.",
    icon: Users,
  },
  {
    title: "Rede sempre ativa",
    description:
      "Monitoramento remoto das telas em tempo real, garantindo que sua marca esteja sempre no ar.",
    icon: ShieldCheck,
  },
];

export default function SobrePage() {
  return (
    <div>
      <section className="bg-telas-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-telas-bronze">
            Sobre a Telas
          </p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Comunicação que conecta.
            <br />
            Resultados que transformam.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-slate-300">
            A Telas é uma plataforma de mídia indoor com atuação em João
            Pessoa, responsável pela instalação e gestão de telas digitais em
            empreendimentos de alto padrão.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {numeros.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-telas-navy text-telas-blue">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Conectamos marcas ao seu público
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Nossa operação combina locais bem selecionados com uma gestão
            próxima de cada parceiro e anunciante, garantindo que cada tela
            entregue o melhor resultado possível para quem confia na Telas.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {valores.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-telas-blue/10"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-telas-navy text-telas-blue">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
