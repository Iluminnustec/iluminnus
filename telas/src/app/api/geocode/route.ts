import { NextRequest, NextResponse } from "next/server";

const HEADERS = {
  "User-Agent": "TelasPainel/1.0 (uso interno)",
};

async function buscar(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) return null;
  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) return null;
  return results[0];
}

export async function GET(request: NextRequest) {
  const endereco = request.nextUrl.searchParams.get("endereco") ?? "";
  const bairro = request.nextUrl.searchParams.get("bairro") ?? "";
  const cidade = request.nextUrl.searchParams.get("cidade") || "João Pessoa";
  const estado = request.nextUrl.searchParams.get("estado") || "PB";

  if (!endereco && !bairro) {
    return NextResponse.json({ error: "Informe ao menos o endereço ou o bairro." }, { status: 400 });
  }

  // do mais específico (endereço completo) ao mais genérico (bairro/cidade),
  // já que ruas menores de João Pessoa nem sempre estão mapeadas no OpenStreetMap
  const tentativas = [
    [endereco, bairro, cidade, estado, "Brasil"],
    [endereco, cidade, estado, "Brasil"],
    [bairro, cidade, estado, "Brasil"],
    [cidade, estado, "Brasil"],
  ]
    .map((partes) => partes.filter(Boolean).join(", "))
    .filter((q, i, arr) => q.length > 0 && arr.indexOf(q) === i);

  try {
    for (let i = 0; i < tentativas.length; i++) {
      const resultado = await buscar(tentativas[i]);
      if (resultado) {
        return NextResponse.json({
          latitude: parseFloat(resultado.lat),
          longitude: parseFloat(resultado.lon),
          displayName: resultado.display_name,
          aproximado: i > 0,
        });
      }
      if (i < tentativas.length - 1) {
        await new Promise((r) => setTimeout(r, 1000)); // respeita o limite de 1 req/s do Nominatim
      }
    }
    return NextResponse.json(
      { error: "Endereço não encontrado, nem por bairro/cidade. Preencha as coordenadas manualmente." },
      { status: 404 }
    );
  } catch {
    return NextResponse.json({ error: "Falha ao consultar o serviço de mapas." }, { status: 502 });
  }
}
