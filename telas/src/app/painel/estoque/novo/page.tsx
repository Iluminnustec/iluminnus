import { ItemForm } from "../item-form";
import { createItemEstoque } from "../actions";

export default function NovoItemEstoquePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Novo item de estoque</h1>
      <ItemForm action={createItemEstoque} submitLabel="Criar item" />
    </div>
  );
}
