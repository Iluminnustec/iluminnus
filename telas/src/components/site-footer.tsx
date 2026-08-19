import Image from "next/image";
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-brivox-navy">
      <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-slate-300">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/telas-icon.png"
              alt="Telas"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <div>
              <p className="font-semibold text-white">Telas</p>
              <p className="text-slate-400">Mídia indoor em João Pessoa, PB</p>
            </div>
          </div>
          <div className="space-y-1">
            <p>
              WhatsApp:{" "}
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-brivox-bronze hover:underline">
                {WHATSAPP_DISPLAY}
              </a>
            </p>
            <p className="text-slate-400 italic">
              Presença que conecta. Impacto que fica.
            </p>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} Telas. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
