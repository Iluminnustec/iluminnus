type TelaOpcao = { id: string; nome: string; predio: { nome: string } };

export function TelaCheckboxList({
  telas,
  defaultSelectedIds = [],
  compact = false,
}: {
  telas: TelaOpcao[];
  defaultSelectedIds?: string[];
  compact?: boolean;
}) {
  return (
    <div
      className={`w-full rounded-md border border-slate-300 bg-white p-2 ${
        compact ? "max-h-28" : "max-h-40"
      } overflow-y-auto`}
    >
      {telas.length === 0 && (
        <p className="px-1 py-1 text-xs text-slate-400">Nenhuma tela cadastrada ainda.</p>
      )}
      {telas.map((tela) => (
        <label
          key={tela.id}
          className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-slate-50"
        >
          <input
            type="checkbox"
            name="telaIds"
            value={tela.id}
            defaultChecked={defaultSelectedIds.includes(tela.id)}
            className="h-4 w-4 shrink-0 accent-telas-navy"
          />
          <span className="truncate">
            {tela.predio.nome} — {tela.nome}
          </span>
        </label>
      ))}
    </div>
  );
}
