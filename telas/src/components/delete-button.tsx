"use client";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Excluir",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form
      action={async () => {
        if (!window.confirm(confirmMessage)) return;
        await action();
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        {label}
      </button>
    </form>
  );
}
