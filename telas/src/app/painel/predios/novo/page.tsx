import { PredioForm } from "../predio-form";
import { createPredio } from "../actions";

export default function NovoPredioPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Novo prédio</h1>
      <PredioForm action={createPredio} submitLabel="Criar prédio" />
    </div>
  );
}
