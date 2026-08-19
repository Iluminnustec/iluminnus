"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClienteSession, destroyClienteSession, getClienteSession } from "@/lib/auth-cliente";
import { calcularPrecoTela, contarOcupacaoPorTela } from "@/lib/precificacao";
import { getEmpresaAtual } from "@/lib/empresa";

export type ClienteAuthState = { error?: string };

const cadastroSchema = z.object({
  nome: z.string().min(1, "Informe seu nome."),
  email: z.string().email("E-mail inválido."),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export async function cadastroClienteAction(
  _prevState: ClienteAuthState,
  formData: FormData
): Promise<ClienteAuthState> {
  let data;
  try {
    data = cadastroSchema.parse(Object.fromEntries(formData.entries()));
  } catch {
    return { error: "Verifique os campos obrigatórios (senha com pelo menos 8 caracteres)." };
  }

  const email = data.email.trim().toLowerCase();
  const existente = await prisma.cliente.findUnique({ where: { email } });
  if (existente?.senhaHash) {
    return { error: "Já existe uma conta com esse e-mail. Faça login." };
  }

  const empresa = await getEmpresaAtual();
  if (!empresa) {
    return { error: "Não foi possível identificar a empresa. Tente novamente mais tarde." };
  }

  // Existe um Cliente sem senha com esse e-mail (ex: cadastro manual pela
  // equipe), mas de OUTRO dono — não deixa o cadastro público "assumir"
  // silenciosamente um registro que não é desta empresa.
  if (existente && existente.empresaId !== empresa.id) {
    return { error: "Já existe uma conta com esse e-mail. Faça login." };
  }

  const senhaHash = await bcrypt.hash(data.senha, 10);

  const cliente = existente
    ? await prisma.cliente.update({
        where: { id: existente.id },
        data: { senhaHash },
      })
    : await prisma.cliente.create({
        data: {
          nome: data.nome,
          email,
          telefone: data.telefone || null,
          cidade: data.cidade || null,
          senhaHash,
          empresaId: empresa.id,
        },
      });

  await createClienteSession({ clienteId: cliente.id, email, nome: cliente.nome, empresaId: cliente.empresaId });
  redirect("/cliente/plano");
}

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function loginClienteAction(
  _prevState: ClienteAuthState,
  formData: FormData
): Promise<ClienteAuthState> {
  let data;
  try {
    data = loginSchema.parse(Object.fromEntries(formData.entries()));
  } catch {
    return { error: "Informe e-mail e senha." };
  }

  const email = data.email.trim().toLowerCase();
  const cliente = await prisma.cliente.findUnique({ where: { email } });
  if (!cliente || !cliente.senhaHash) {
    return { error: "E-mail ou senha inválidos." };
  }

  if (!cliente.ativo) {
    return { error: "Esta conta está inativa. Fale com a Brivox." };
  }

  const senhaValida = await bcrypt.compare(data.senha, cliente.senhaHash);
  if (!senhaValida) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createClienteSession({ clienteId: cliente.id, email, nome: cliente.nome, empresaId: cliente.empresaId });
  redirect("/cliente/plano");
}

export async function logoutClienteAction() {
  await destroyClienteSession();
  redirect("/cliente/login");
}

export type PropostaState = { error?: string; sucesso?: boolean };

export async function enviarPropostaAction(
  _prevState: PropostaState,
  formData: FormData
): Promise<PropostaState> {
  const session = await getClienteSession();
  if (!session) {
    return { error: "Sua sessão expirou. Faça login novamente." };
  }

  const telaIds = formData.getAll("telaIds").map(String);
  if (telaIds.length === 0) {
    return { error: "Selecione pelo menos uma tela." };
  }

  const [telas, midiasAtivas] = await Promise.all([
    prisma.tela.findMany({ where: { id: { in: telaIds }, empresaId: session.empresaId } }),
    prisma.midia.findMany({
      where: { ativo: true, clienteId: { not: null }, empresaId: session.empresaId },
      select: { clienteId: true, telas: { select: { id: true } } },
    }),
  ]);

  const ocupacaoPorTela = contarOcupacaoPorTela(midiasAtivas);

  const itens = telas.map((tela) => {
    const ocupacao = ocupacaoPorTela.get(tela.id) ?? 0;
    const preco = calcularPrecoTela(tela.precoBase, ocupacao);
    return { telaId: tela.id, precoNoMomento: preco.precoAtual };
  });

  const valorTotal = itens.reduce((soma, item) => soma + item.precoNoMomento, 0);

  await prisma.proposta.create({
    data: {
      empresaId: session.empresaId,
      clienteId: session.clienteId,
      valorTotal,
      itens: { create: itens },
    },
  });

  revalidatePath("/cliente/propostas");
  redirect("/cliente/propostas");
}
