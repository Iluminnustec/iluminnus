"use client";

import dynamic from "next/dynamic";

const PrediosMap = dynamic(
  () => import("./predios-map").then((mod) => mod.PrediosMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
        Carregando mapa...
      </div>
    ),
  }
);

type PredioPin = {
  id: string;
  nome: string;
  bairro: string | null;
  latitude: number;
  longitude: number;
  totalTelas: number;
};

export function PrediosMapLoader({ predios }: { predios: PredioPin[] }) {
  return <PrediosMap predios={predios} />;
}
