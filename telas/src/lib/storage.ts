import "server-only";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "midias";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SECRET_KEY as string
);

export async function garantirBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const existe = buckets?.some((b) => b.name === BUCKET);
  if (!existe) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
}

export async function uploadMidiaArquivo(arquivo: File) {
  await garantirBucket();

  const extensao = arquivo.name.split(".").pop() ?? "bin";
  const caminho = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, buffer, { contentType: arquivo.type, upsert: false });

  if (error) {
    throw new Error(`Falha ao enviar arquivo: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho);

  return { url: publicUrlData.publicUrl, caminhoStorage: caminho };
}

// Gera uma URL assinada de upload: o navegador envia o arquivo direto pro
// Supabase (sem passar pelo servidor da Vercel, que tem limite de ~4.5MB
// por requisicao) e so depois avisamos o servidor pra criar o registro.
export async function criarUploadAssinado(nomeArquivo: string) {
  await garantirBucket();

  const extensao = nomeArquivo.split(".").pop() ?? "bin";
  const caminho = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(caminho);

  if (error || !data) {
    throw new Error(`Falha ao gerar autorização de upload: ${error?.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho);

  return {
    caminhoStorage: caminho,
    token: data.token,
    url: publicUrlData.publicUrl,
  };
}

export async function deletarMidiaArquivo(caminhoStorage: string) {
  await supabase.storage.from(BUCKET).remove([caminhoStorage]);
}
