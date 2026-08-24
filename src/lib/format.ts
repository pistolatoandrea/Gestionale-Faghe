export function formatDateIT(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatDateTimeIT(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${formatDateIT(date)} ${hh}:${min}`;
}
