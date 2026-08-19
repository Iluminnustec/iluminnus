import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

function gerarLicenca() {
  const bloco = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `TELAS-${bloco()}-${bloco()}-${bloco()}`;
}

const SUPER_ADMINS = [
  {
    nome: "Administrador Iluminnus",
    email: "iluminnustec@gmail.com",
    // Senha só usada se este seed criar a conta do zero (ex: banco novo).
    // A senha real em uso hoje foi trocada direto no banco, não é esta.
    senha: "trocar-no-primeiro-acesso-2026",
    cargo: "SUPER_ADMIN" as const,
  },
];

const EMPRESA_BRIVOX = {
  nome: "Brivox Mídia",
  slug: "brivox-midia",
  dominio: "brivoxmidia.com.br",
  cidade: "João Pessoa",
  estado: "PB",
};

const USUARIOS_BRIVOX = [
  { nome: "Administrador Brivox", email: "admin@brivoxmidia.com.br", senha: "brivox2026", cargo: "ADMIN" as const },
  { nome: "Supervisor Brivox", email: "supervisor@brivoxmidia.com.br", senha: "supervisor2026", cargo: "SUPERVISOR" as const },
  { nome: "Vendas Brivox", email: "vendas@brivoxmidia.com.br", senha: "vendas2026", cargo: "VENDAS" as const },
];

async function main() {
  // Staff da própria Iluminnus (sem empresaId — acessa /admin, não /painel).
  for (const u of SUPER_ADMINS) {
    const existente = await prisma.usuario.findUnique({ where: { email: u.email } });
    if (existente) {
      console.log(`Super-admin ${u.email} já existe, pulando.`);
      continue;
    }
    const senhaHash = await bcrypt.hash(u.senha, 10);
    await prisma.usuario.create({
      data: { nome: u.nome, email: u.email, senhaHash, cargo: u.cargo },
    });
    console.log(`Super-admin criado: ${u.email} / senha: ${u.senha}`);
  }

  // Brivox Mídia é o primeiro dono cadastrado no sistema — mesma empresa que
  // originou o produto, agora rodando como um tenant normal.
  let empresa = await prisma.empresa.findUnique({ where: { slug: EMPRESA_BRIVOX.slug } });
  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: { ...EMPRESA_BRIVOX, licenca: gerarLicenca() },
    });
    console.log(`Empresa criada: ${empresa.nome} (${empresa.slug})`);

    const proximoVencimento = new Date();
    proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
    await prisma.assinatura.create({
      data: {
        empresaId: empresa.id,
        plano: "Padrão",
        // Valor placeholder — ajustar para o valor real combinado com o dono.
        valorMensal: 0,
        diaVencimento: 5,
        status: "ATIVA",
        proximoVencimento,
      },
    });
    console.log("Assinatura criada para Brivox Mídia (valorMensal é placeholder, ajustar).");
  } else {
    console.log(`Empresa ${empresa.slug} já existe, pulando.`);
  }

  for (const u of USUARIOS_BRIVOX) {
    const existente = await prisma.usuario.findUnique({ where: { email: u.email } });
    if (existente) {
      console.log(`Usuário ${u.email} já existe, pulando.`);
      continue;
    }

    const senhaHash = await bcrypt.hash(u.senha, 10);
    await prisma.usuario.create({
      data: { nome: u.nome, email: u.email, senhaHash, cargo: u.cargo, empresaId: empresa.id },
    });
    console.log(`Usuário criado: ${u.email} / senha: ${u.senha} (${u.cargo})`);
  }

  console.log("Troque as senhas assim que possível.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
