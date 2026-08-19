import { NextResponse } from "next/server";
import { PLAYER_VERSAO_CODE, PLAYER_VERSAO_NAME, PLAYER_APK_URL } from "@/lib/player-version";

export async function GET() {
  return NextResponse.json(
    {
      versaoCode: PLAYER_VERSAO_CODE,
      versaoNome: PLAYER_VERSAO_NAME,
      apkUrl: PLAYER_APK_URL,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
