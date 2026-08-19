"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarUploadMidia, confirmarMidia } from "@/app/painel/midia/actions";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { TelaCheckboxList } from "@/components/tela-checkbox-list";

export function MidiaUploadForm({
  clientes,
  telas,
}: {
  clientes: { id: string; nome: string }[];
  telas: { id: string; nome: string; predio: { nome: string } }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const arquivo = formData.get("arquivo") as File | null;

    if (!arquivo || arquivo.size === 0) {
      setError("Selecione um arquivo de imagem ou vídeo.");
      return;
    }

    setEnviando(true);
    try {
      const autorizacao = await iniciarUploadMidia(arquivo.name, arquivo.type, arquivo.size);
      if ("error" in autorizacao) {
        setError(autorizacao.error);
        return;
      }

      const { error: uploadError } = await supabaseBrowser.storage
        .from("midias")
        .uploadToSignedUrl(autorizacao.caminhoStorage, autorizacao.token, arquivo);

      if (uploadError) {
        setError(`Falha ao enviar o arquivo: ${uploadError.message}`);
        return;
      }

      const nome = (formData.get("nome") as string)?.trim() || arquivo.name;
      const duracaoSegundos = Number(formData.get("duracaoSegundos") ?? 10) || 10;
      const clienteId = (formData.get("clienteId") as string) || undefined;
      const telaIds = formData.getAll("telaIds").map(String);

      const resultado = await confirmarMidia({
        nome,
        tipo: autorizacao.tipo,
        url: autorizacao.url,
        caminhoStorage: autorizacao.caminhoStorage,
        duracaoSegundos,
        clienteId,
        telaIds,
      });

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Falha inesperada no upload. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="lg:col-span-2">
        <label htmlFor="arquivo" className="block text-sm font-medium text-slate-700">
          Arquivo (imagem ou vídeo) *
        </label>
        <input
          id="arquivo"
          name="arquivo"
          type="file"
          required
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <p className="mt-1 text-xs text-slate-400">
          Envio vai direto para o storage — vídeos de até 500MB são suportados.
        </p>
      </div>

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
          Nome (opcional)
        </label>
        <input
          id="nome"
          name="nome"
          placeholder="Ex: Promo Agosto"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="duracaoSegundos" className="block text-sm font-medium text-slate-700">
          Duração (segundos)
        </label>
        <input
          id="duracaoSegundos"
          name="duracaoSegundos"
          type="number"
          min="1"
          defaultValue={10}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-400">Usado só para imagens; vídeo toca até o fim.</p>
      </div>

      <div>
        <label htmlFor="clienteId" className="block text-sm font-medium text-slate-700">
          Cliente vinculado (opcional)
        </label>
        <select
          id="clienteId"
          name="clienteId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-telas-blue focus:outline-none"
        >
          <option value="">Nenhum (institucional)</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Telas onde aparece</span>
        <div className="mt-1">
          <TelaCheckboxList telas={telas} />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Marque as telas onde esse anúncio deve aparecer. Nenhuma marcada = toca em todas
          (institucional).
        </p>
      </div>

      <div className="flex items-end lg:col-span-2">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-telas-navy px-5 py-2 text-sm font-semibold text-white hover:bg-telas-navy-light disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Adicionar à playlist"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 lg:col-span-4">{error}</p>}
    </form>
  );
}
