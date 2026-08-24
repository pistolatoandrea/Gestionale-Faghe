import type { InterventoStato } from "@/lib/supabase/types";

export const INTERVENTO_STATO_OPTIONS: {
  value: InterventoStato;
  label: string;
  badgeClassName: string;
}[] = [
  {
    value: "da_fare",
    label: "Da Fare",
    badgeClassName: "bg-blue-500/15 text-blue-400",
  },
  {
    value: "da_tornare",
    label: "Da Tornare",
    badgeClassName: "bg-amber-500/15 text-amber-400",
  },
  {
    value: "chiuso",
    label: "Chiuso",
    badgeClassName: "bg-emerald-500/15 text-emerald-400",
  },
];

export function interventoStatoLabel(stato: InterventoStato): string {
  return INTERVENTO_STATO_OPTIONS.find((o) => o.value === stato)?.label ?? stato;
}

export function interventoStatoBadgeClassName(stato: InterventoStato): string {
  return INTERVENTO_STATO_OPTIONS.find((o) => o.value === stato)?.badgeClassName ?? "";
}
