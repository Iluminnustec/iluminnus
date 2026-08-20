import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AtivarForm } from "./ativar-form";

export default async function AtivarContaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const cliente = token
    ? await prisma.cliente.findUnique({
        where: { tokenAtivacao: token },
        select: { nome: true, email: true },
      })
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/telas-icon.png"
            alt="Telas"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-semibold text-slate-900">Telas</span>
        </Link>

        {cliente ? (
          <>
            <h1 className="mt-6 text-xl font-bold text-slate-900">Olá, {cliente.nome}!</h1>
            <p className="mt-1 text-sm text-slate-500">
              Falta só definir sua senha pra acessar sua conta e acompanhar suas propostas.
            </p>
            <AtivarForm token={token!} emailJaTem={!!cliente.email} />
          </>
        ) : (
          <>
            <h1 className="mt-6 text-xl font-bold text-slate-900">Link inválido</h1>
            <p className="mt-1 text-sm text-slate-500">
              Esse link de ativação não existe mais — ou já foi usado antes. Fale com quem te
              enviou pra receber um novo.
            </p>
          </>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-telas-blue hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
