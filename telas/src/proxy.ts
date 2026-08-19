import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { podeAcessar, rotaInicial, type Cargo } from "@/lib/rbac";

const SESSION_COOKIE = "telas_session";
const secretKey = process.env.SESSION_SECRET ?? "telas-dev-secret-troque-em-producao";
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    const cargo = payload.cargo as Cargo;

    if (!podeAcessar(cargo, pathname)) {
      return NextResponse.redirect(new URL(rotaInicial(cargo), request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/painel/:path*", "/admin/:path*"],
};
