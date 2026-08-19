"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
        <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.3 21.7 0 14 0z" fill="#003366"/>
        <circle cx="14" cy="14" r="6" fill="#CD7F32"/>
      </svg>
    `),
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -34],
});

const JOAO_PESSOA_CENTER: [number, number] = [-7.115, -34.845];

type PredioPin = {
  id: string;
  nome: string;
  bairro: string | null;
  latitude: number;
  longitude: number;
  totalTelas: number;
};

export function PrediosMap({ predios }: { predios: PredioPin[] }) {
  return (
    <MapContainer
      center={JOAO_PESSOA_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {predios.map((predio) => (
        <Marker key={predio.id} position={[predio.latitude, predio.longitude]} icon={markerIcon}>
          <Popup>
            <strong>{predio.nome}</strong>
            {predio.bairro && <><br />{predio.bairro}</>}
            <br />
            {predio.totalTelas} {predio.totalTelas === 1 ? "tela" : "telas"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
