export interface TicketChecklistItem {
  slug: string;
  label: string;
}

export const TICKET_CHECKLIST: TicketChecklistItem[] = [
  { slug: "report", label: "Report" },
  { slug: "dati", label: "Dati" },
  { slug: "fatturare", label: "Fatturare" },
  { slug: "preventivo", label: "Preventivo" },
  { slug: "consuntivo", label: "Consuntivo" },
  { slug: "gestire", label: "Gestire" },
  { slug: "fissare", label: "Fissare" },
];
