import type { TicketStato } from "@/lib/supabase/types";

export const TICKET_STATO_OPTIONS: { value: TicketStato; label: string; badgeClassName: string }[] = [
  {
    value: "nuovo",
    label: "Nuovo",
    badgeClassName: "bg-blue-500/15 text-blue-400",
  },
  {
    value: "programmato_intervento",
    label: "Programmato Intervento",
    badgeClassName: "bg-amber-500/15 text-amber-400",
  },
  {
    value: "chiuso",
    label: "Chiuso",
    badgeClassName: "bg-emerald-500/15 text-emerald-400",
  },
  {
    value: "perso",
    label: "Perso",
    badgeClassName: "bg-zinc-500/20 text-zinc-400",
  },
];

export function ticketStatoLabel(stato: TicketStato): string {
  return TICKET_STATO_OPTIONS.find((o) => o.value === stato)?.label ?? stato;
}

export function ticketStatoBadgeClassName(stato: TicketStato): string {
  return TICKET_STATO_OPTIONS.find((o) => o.value === stato)?.badgeClassName ?? "";
}
