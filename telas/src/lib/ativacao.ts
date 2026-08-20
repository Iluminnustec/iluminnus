import "server-only";
import { randomBytes } from "crypto";

// Token de ativação de conta do cliente (link de "definir senha" enviado
// pela equipe do dono). Precisa de bastante entropia pois vai numa URL
// pública e dá acesso direto à conta — diferente do código de indicação
// (6 chars, só identifica quem indicou, sem dar acesso a nada).
export function gerarTokenAtivacao(): string {
  return randomBytes(24).toString("base64url");
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://admin.iluminnus.com.br";

export function linkAtivacaoCliente(token: string): string {
  return `${SITE_URL}/cliente/ativar?token=${token}`;
}

// Normaliza telefone BR pro formato E.164 sem o "+", que é o que o wa.me
// espera (ex: 5583999999999). Aceita o usuário já ter digitado com ou sem DDI.
export function telefoneParaWhatsapp(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) return digitos;
  return `55${digitos}`;
}

export function linkWhatsapp(telefone: string, mensagem: string): string {
  const numero = telefoneParaWhatsapp(telefone);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
