import "server-only";

// Um dono fica bloqueado quando é desativado manualmente (kill-switch) ou
// quando a assinatura está Suspensa/Cancelada. Atrasada ainda dá acesso —
// é o "prazo de tolerância" antes do super-admin decidir suspender de fato.
export function empresaBloqueada(empresa: {
  ativo: boolean;
  assinatura: { status: string } | null;
}): boolean {
  if (!empresa.ativo) return true;
  if (!empresa.assinatura) return false;
  return empresa.assinatura.status === "SUSPENSA" || empresa.assinatura.status === "CANCELADA";
}
