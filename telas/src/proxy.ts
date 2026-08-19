import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { podeAcessar, rotaInicial, type Cargo } from "@/lib/rbac";

const SESSION_COOKIE = "telas_session";
const secretKey = process.env.SESSION_SECRET ?? "telas-dev-secret-troque-em-producao";
const encodedKey = new TextEncoder().encode(secretKey);

// Subdomínio oficial da Iluminnus pro /admin (o sistema "mãe" que gerencia
// os donos do Telas) -- assim ele vive dentro do domínio que a Iluminnus
// paga, não no link gratuito do deploy do produto Telas. Nesse host, toda
// rota (exceto /login) é servida como se fosse /admin/<rota>.
const ADMIN_HOST = process.env.ADMIN_HOST ?? "admin.iluminnus.com.br";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  const { pathname } = request.nextUrl;

  const noHostDeAdmin = host !== ADMIN_HOST;
  const jaEhAdminOuLogin = pathname.startsWith("/admin") || pathname.startsWith("/login");

  const targetPathname =
    noHostDeAdmin || jaEhAdminOuLogin
      ? pathname
      : pathname === "/"
        ? "/admin"
        : `/admin${pathname}`;

  const gated = targetPathname.startsWith("/painel") || targetPathname.startsWith("/admin");

  function seguir() {
    if (targetPathname === pathname) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = targetPathname;
    return NextResponse.rewrite(url);
  }

  if (!gated) {
    return seguir();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    const cargo = payload.cargo as Cargo;

    if (!podeAcessar(cargo, targetPathname)) {
      return NextResponse.redirect(new URL(rotaInicial(cargo), request.url));
    }

    return seguir();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
