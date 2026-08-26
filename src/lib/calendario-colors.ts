// Colori/etichette per i tre "tipi sorgente" mostrati nel calendario:
// interventi e task letti dalle rispettive tabelle, eventi generici ("Altro")
// dalla tabella eventi. Nessuno di questi corrisponde più a una colonna "tipo"
// nel database: sono derivati dalla provenienza del dato.

export type CalendarSource = "intervento" | "task" | "evento";

export const CALENDAR_SOURCE_STYLE: Record<CalendarSource, { color: string; label: string }> = {
  intervento: { color: "#0a84ff", label: "Intervento" },
  task: { color: "#ffd60a", label: "Task" },
  evento: { color: "#8e8e93", label: "Altro" },
};
