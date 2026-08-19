import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Cargo } from "@/lib/rbac";

export type { Cargo } from "@/lib/rbac";
export { podeAcessar, rotaInicial, ROTAS_POR_CARGO, CARGO_LABELS } from "@/lib/rbac";

const SESSION_COOKIE = "brivox_session";
const secretKey = process.env.SESSION_SECRET ?? "brivox-dev-secret-troque-em-producao";
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  email: string;
  nome: string;
  cargo: Cargo;
  // null = staff da própria Iluminnus (cargo SUPER_ADMIN), não pertence a
  // nenhum dono.
  empresaId: string | null;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Toda página/action de /painel roda só depois do proxy garantir um cargo de
// staff de dono (nunca SUPER_ADMIN) — então empresaId sempre existe aqui.
// Centraliza essa checagem em vez de repetir "if (!session.empresaId)" em
// cada módulo.
export async function getSessaoComEmpresa(): Promise<
  SessionPayload & { empresaId: string }
> {
  const session = await getSession();
  if (!session || !session.empresaId) {
    throw new Error("Sessão inválida para esta área.");
  }
  return { ...session, empresaId: session.empresaId };
}
