import { redirect } from "next/navigation";

// Login unificado: staff e clientes entram por /login agora. Essa rota
// continua existindo só pra não quebrar links antigos já salvos/enviados.
export default function LoginClienteRedirect() {
  redirect("/login");
}
