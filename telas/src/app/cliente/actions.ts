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
  ref: z.string().optional(),
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

  // Código de indicação (?ref=...) vincula o cliente automaticamente ao
  // vendedor dono do código -- só se o vendedor for da MESMA empresa que
  // este cadastro está resolvendo (empresa vem do domínio da visita); um
  // código de outro dono é silenciosamente ignorado, nunca vaza vínculo
  // entre tenants diferentes.
  let vendedorId: string | undefined;
  if (data.ref) {
    const vendedor = await prisma.usuario.findUnique({
      where: { codigoReferral: data.ref.toUpperCase() },
      select: { id: true, empresaId: true },
    });
    if (vendedor && vendedor.empresaId === empresa.id) {
      vendedorId = vendedor.id;
    }
  }

  const cliente = existente
    ? await prisma.cliente.update({
        where: { id: existente.id },
        data: { senhaHash, ...(vendedorId ? { vendedorId } : {}) },
      })
    : await prisma.cliente.create({
        data: {
          nome: data.nome,
          email,
          telefone: data.telefone || null,
          cidade: data.cidade || null,
          senhaHash,
          empresaId: empresa.id,
          vendedorId,
        },
      });

  await createClienteSession({ clienteId: cliente.id, email, nome: cliente.nome, empresaId: cliente.empresaId });
  redirect("/cliente/plano");
}

const ativacaoSchema = z.object({
  token: z.string().min(1),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

// Segunda etapa do cadastro feito pela equipe do dono: o cliente chega aqui
// pelo link de ativação (token único, ver src/lib/ativacao.ts), define a
// própria senha (e o e-mail, se a equipe não tiver preenchido) e já sai logado.
export async function ativarContaCliente(
  _prevState: ClienteAuthState,
  formData: FormData
): Promise<ClienteAuthState> {
  let data;
  try {
    data = ativacaoSchema.parse(Object.fromEntries(formData.entries()));
  } catch {
    return { error: "Verifique os campos (senha com pelo menos 8 caracteres)." };
  }

  const cliente = await prisma.cliente.findUnique({ where: { tokenAtivacao: data.token } });
  if (!cliente) {
    return { error: "Link inválido ou já usado. Fale com quem te enviou pra gerar um novo." };
  }

  const email = (data.email || cliente.email || "").trim().toLowerCase();
  if (!email) {
    return { error: "Informe seu e-mail — é o que você vai usar pra entrar depois." };
  }

  if (email !== cliente.email) {
    const emailEmUso = await prisma.cliente.findUnique({ where: { email } });
    if (emailEmUso) {
      return { error: "Já existe uma conta com esse e-mail." };
    }
  }

  const senhaHash = await bcrypt.hash(data.senha, 10);
  await prisma.cliente.update({
    where: { id: cliente.id },
    data: { senhaHash, email, tokenAtivacao: null },
  });

  await createClienteSession({
    clienteId: cliente.id,
    email,
    nome: cliente.nome,
    empresaId: cliente.empresaId,
  });
  redirect("/cliente/plano");
}

export async function logoutClienteAction() {
  await destroyClienteSession();
  redirect("/login");
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
