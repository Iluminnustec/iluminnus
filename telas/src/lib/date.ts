export function formatDateBR(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function toDateInputValue(date?: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}
