import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TaskEntityType, TaskStato } from "@/lib/supabase/types";

export interface TaskRow {
  id: string;
  titolo: string;
  stato: TaskStato;
  scadenza: string | null;
  created_at: string;
  entity_type: TaskEntityType | null;
  entity_id: string | null;
}

export interface TaskRowWithLink extends TaskRow {
  linkedLabel: string | null;
  linkedHref: string | null;
}

const ENTITY_HREF: Record<TaskEntityType, (id: string) => string> = {
  ticket: (id) => `/ticket/${id}`,
  cliente: (id) => `/clienti/${id}`,
  intervento: () => `/calendario`,
};

export async function resolveTaskLinks(
  supabase: SupabaseClient<Database>,
  tasks: TaskRow[]
): Promise<TaskRowWithLink[]> {
  const ticketIds = tasks
    .filter((t) => t.entity_type === "ticket" && t.entity_id)
    .map((t) => t.entity_id as string);
  const clienteIds = tasks
    .filter((t) => t.entity_type === "cliente" && t.entity_id)
    .map((t) => t.entity_id as string);

  const [ticketsRes, clientiRes] = await Promise.all([
    ticketIds.length
      ? supabase.from("ticket").select("id, titolo").in("id", ticketIds)
      : Promise.resolve({ data: [] as { id: string; titolo: string }[] }),
    clienteIds.length
      ? supabase.from("clienti").select("id, nome").in("id", clienteIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
  ]);

  const ticketMap = new Map((ticketsRes.data ?? []).map((t) => [t.id, t.titolo]));
  const clienteMap = new Map((clientiRes.data ?? []).map((c) => [c.id, c.nome]));

  return tasks.map((t) => {
    if (!t.entity_type || !t.entity_id) {
      return { ...t, linkedLabel: null, linkedHref: null };
    }

    const label =
      t.entity_type === "ticket"
        ? (ticketMap.get(t.entity_id) ?? null)
        : t.entity_type === "cliente"
          ? (clienteMap.get(t.entity_id) ?? null)
          : "Intervento";

    return {
      ...t,
      linkedLabel: label,
      linkedHref: label ? ENTITY_HREF[t.entity_type](t.entity_id) : null,
    };
  });
}
