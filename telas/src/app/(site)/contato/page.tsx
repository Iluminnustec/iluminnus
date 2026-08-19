import { MessageCircle, MapPin, Clock } from "lucide-react";
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from "@/lib/brand";

const infos = [
  { label: "Cidade", value: "João Pessoa, PB", icon: MapPin },
  { label: "Atendimento", value: "Seg. a sex., 8h às 18h", icon: Clock },
];

export default function ContatoPage() {
  return (
    <div>
      <section className="bg-brivox-navy text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-brivox-bronze">
            Contato
          </p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
            Fale com a Brivox Mídia
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-slate-300">
            Quer anunciar em nossa rede de telas ou tornar-se um ponto
            parceiro? Fale com a gente pelo WhatsApp.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col justify-between rounded-xl border border-brivox-bronze/30 bg-white p-8 shadow-sm">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brivox-navy text-brivox-blue">
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Converse agora pelo WhatsApp
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Resposta rápida para dúvidas, planos e parcerias.
              </p>
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-brivox-bronze px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
            >
              WhatsApp: {WHATSAPP_DISPLAY}
            </a>
          </div>

          <div className="flex flex-col gap-4">
            {infos.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brivox-navy text-brivox-blue">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {item.label}
                    </p>
                    <p className="font-semibold text-slate-900">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
