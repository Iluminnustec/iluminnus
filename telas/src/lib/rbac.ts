export type Cargo = "SUPER_ADMIN" | "ADMIN" | "SUPERVISOR" | "VENDAS" | "SOCIO";

export const CARGO_LABELS: Record<Cargo, string> = {
  SUPER_ADMIN: "Administrador Iluminnus",
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  VENDAS: "Vendas",
  SOCIO: "Sócio",
};

// paginas que cada cargo pode acessar (prefixo de rota). SUPER_ADMIN é staff
// da própria Iluminnus (não pertence a nenhum dono) e só acessa /admin — os
// demais cargos são de staff de um dono e só acessam /painel.
export const ROTAS_POR_CARGO: Record<Cargo, string[]> = {
  SUPER_ADMIN: ["/admin"],
  ADMIN: [
    "/painel",
    "/painel/predios",
    "/painel/telas",
    "/painel/midia",
    "/painel/dispositivos",
    "/painel/clientes",
    "/painel/receitas",
    "/painel/despesas",
    "/painel/comissoes",
    "/painel/propostas",
    "/painel/estoque",
    "/painel/usuarios",
    "/painel/atividades",
    "/painel/senha",
  ],
  SUPERVISOR: [
    "/painel",
    "/painel/predios",
    "/painel/telas",
    "/painel/midia",
    "/painel/dispositivos",
    "/painel/clientes",
    "/painel/receitas",
    "/painel/despesas",
    "/painel/comissoes",
    "/painel/propostas",
    "/painel/estoque",
    "/painel/atividades",
    "/painel/senha",
  ],
  VENDAS: ["/painel/clientes", "/painel/senha"],
  SOCIO: [
    "/painel",
    "/painel/predios",
    "/painel/telas",
    "/painel/midia",
    "/painel/dispositivos",
    "/painel/clientes",
    "/painel/receitas",
    "/painel/despesas",
    "/painel/comissoes",
    "/painel/propostas",
    "/painel/estoque",
    "/painel/senha",
  ],
};

export function podeAcessar(cargo: Cargo, pathname: string): boolean {
  const rotas = ROTAS_POR_CARGO[cargo];
  return rotas.some((rota) => {
    // "/painel" é a raiz do dashboard — só combina com ela mesma, senão
    // vira um prefixo que libera qualquer sub-rota para todo mundo que tem
    // acesso ao dashboard.
    if (rota === "/painel") return pathname === "/painel";
    return pathname === rota || pathname.startsWith(rota + "/");
  });
}

export function rotaInicial(cargo: Cargo): string {
  if (cargo === "SUPER_ADMIN") return "/admin";
  return cargo === "VENDAS" ? "/painel/clientes" : "/painel";
}
