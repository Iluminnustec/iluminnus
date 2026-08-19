import "server-only";
import crypto from "crypto";
import type { Prisma } from "@/generated/prisma/client";

const MAPA_ACENTOS: Record<string, string> = {
  á: "a", à: "a", â: "a", ã: "a", ä: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", õ: "o", ö: "o",
  ú: "u", ù: "u", û: "u", ü: "u",
  ç: "c", ñ: "n",
};

export function slugify(valor: string) {
  return valor
    .toLowerCase()
    .split("")
    .map((c) => MAPA_ACENTOS[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function gerarLicenca() {
  const bloco = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `TELAS-${bloco()}-${bloco()}-${bloco()}`;
}

export function proximoVencimentoApartirDe(base: Date, diaVencimento: number) {
  return new Date(base.getFullYear(), base.getMonth() + 1, diaVencimento);
}

export type DadosProvisionamentoEmpresa = {
  nome: string;
  dominio?: string | null;
  cidade?: string | null;
  estado?: string | null;
  plano: string;
  valorMensal: number;
  diaVencimento: number;
  status?: "ATIVA" | "ATRASADA" | "SUSPENSA" | "CANCELADA";
  trialAte?: Date | null;
  adminNome: string;
  adminEmail: string;
  adminSenhaHash: string;
  indicadorId?: string | null;
};

// Slug do App usado por este próprio produto -- toda Empresa provisionada
// aqui ganha uma Licenca pra esse App (registro central da Iluminnus).
const APP_SLUG_TELAS = "telas";

// Cria Empresa + Licenca (do App Telas) + Assinatura + primeiro Usuario
// (ADMIN) numa transação só — usado tanto pelo cadastro manual em /admin
// quanto pelo auto-cadastro público em /assinar. Quem chama já validou que
// slug/e-mail não existem.
export async function provisionarEmpresa(
  tx: Prisma.TransactionClient,
  dados: DadosProvisionamentoEmpresa
) {
  const slug = slugify(dados.nome);
  const proximoVencimento = proximoVencimentoApartirDe(new Date(), dados.diaVencimento);

  const appTelas = await tx.app.upsert({
    where: { slug: APP_SLUG_TELAS },
    create: { nome: "Telas", slug: APP_SLUG_TELAS },
    update: {},
  });

  const empresa = await tx.empresa.create({
    data: {
      nome: dados.nome,
      slug,
      dominio: dados.dominio || null,
      cidade: dados.cidade || null,
      estado: dados.estado || null,
      indicadorId: dados.indicadorId || null,
    },
  });

  await tx.licenca.create({
    data: {
      empresaId: empresa.id,
      appId: appTelas.id,
      codigo: gerarLicenca(),
    },
  });

  const assinatura = await tx.assinatura.create({
    data: {
      empresaId: empresa.id,
      plano: dados.plano,
      valorMensal: dados.valorMensal,
      diaVencimento: dados.diaVencimento,
      status: dados.status ?? "ATIVA",
      trialAte: dados.trialAte ?? null,
      proximoVencimento,
    },
  });

  const usuario = await tx.usuario.create({
    data: {
      nome: dados.adminNome,
      email: dados.adminEmail,
      senhaHash: dados.adminSenhaHash,
      cargo: "ADMIN",
      empresaId: empresa.id,
    },
  });

  return { empresa, assinatura, usuario };
}
