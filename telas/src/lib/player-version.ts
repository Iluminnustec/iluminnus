// Versao mais recente do app Android "Telas Player" (caixinha das telas).
// Atualizar aqui (e rodar o script de upload do APK) toda vez que uma nova
// versao do app-player for lancada. O app consulta /api/dispositivos/versao
// pra saber se precisa se auto-atualizar.
export const PLAYER_VERSAO_CODE = 9;
export const PLAYER_VERSAO_NAME = "1.0.8";
// Nome do arquivo no Supabase Storage ainda não foi trocado — renomear o
// objeto lá (e o script de upload do APK) antes de mudar esta URL, senão
// o app quebra a auto-atualização nas telas físicas.
export const PLAYER_APK_URL =
  "https://njkyvijyysawjzyxbypw.supabase.co/storage/v1/object/public/midias/app/brivox-player-latest.apk";
