import type { TaskStato } from "@/lib/supabase/types";

export const TASK_STATO_OPTIONS: { value: TaskStato; label: string; badgeClassName: string }[] = [
  {
    value: "aperto",
    label: "Aperto",
    badgeClassName: "bg-blue-500/15 text-blue-400",
  },
  {
    value: "in_pausa",
    label: "In Pausa",
    badgeClassName: "bg-amber-500/15 text-amber-400",
  },
  {
    value: "chiuso",
    label: "Chiuso",
    badgeClassName: "bg-emerald-500/15 text-emerald-400",
  },
];

export function taskStatoLabel(stato: TaskStato): string {
  return TASK_STATO_OPTIONS.find((o) => o.value === stato)?.label ?? stato;
}

export function taskStatoBadgeClassName(stato: TaskStato): string {
  return TASK_STATO_OPTIONS.find((o) => o.value === stato)?.badgeClassName ?? "";
}
