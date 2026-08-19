import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "brivox_cliente_session";
const secretKey = process.env.SESSION_SECRET ?? "brivox-dev-secret-troque-em-producao";
const encodedKey = new TextEncoder().encode(secretKey);

export type ClienteSessionPayload = {
  clienteId: string;
  email: string;
  nome: string;
  empresaId: string;
};

export async function createClienteSession(payload: ClienteSessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroyClienteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getClienteSession(): Promise<ClienteSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as unknown as ClienteSessionPayload;
  } catch {
    return null;
  }
}
