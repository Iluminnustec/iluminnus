import { redirect } from "next/navigation";
import { getClienteSession } from "@/lib/auth-cliente";

export default async function ClienteIndexPage() {
  const session = await getClienteSession();
  redirect(session ? "/cliente/plano" : "/cliente/login");
}
