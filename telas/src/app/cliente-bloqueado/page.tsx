import { redirect } from "next/navigation";
import { getClienteSession } from "@/lib/auth-cliente";
import { logoutClienteAction } from "@/app/cliente/actions";

export default async function ClienteBloqueadoPage() {
  const session = await getClienteSession();
  if (!session) redirect("/cliente/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Área indisponível</h1>
        <p className="mt-3 text-sm text-slate-600">
          Esta área está temporariamente indisponível. Entre em contato para mais informações.
        </p>
        <form action={logoutClienteAction} className="mt-6">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
