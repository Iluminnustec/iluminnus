import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/painel/actions";

export default async function PainelBloqueadoPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Acesso suspenso</h1>
        <p className="mt-3 text-sm text-slate-600">
          O acesso da sua empresa ao Telas está temporariamente suspenso. Fale com a Iluminnus
          para regularizar a assinatura.
        </p>
        <form action={logoutAction} className="mt-6">
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
