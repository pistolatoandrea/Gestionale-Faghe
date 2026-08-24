import type { ClienteTipo } from "@/lib/supabase/types";

export interface ActiveTicketJoinRow {
  cliente_id: string;
  created_at: string;
  clienti: {
    id: string;
    nome: string;
    tipo: ClienteTipo;
    telefono: string | null;
    email: string | null;
    citta: string | null;
  } | null;
}

export interface ClienteAttivo {
  id: string;
  nome: string;
  tipo: ClienteTipo;
  telefono: string | null;
  email: string | null;
  citta: string | null;
  ticketAttivi: number;
  ultimaAttivita: string;
}

// Deriva i clienti distinti con almeno un ticket attivo dai ticket più recenti,
// mantenendo l'ordine di ultima attività (i ticket in ingresso sono già ordinati desc).
export function buildClientiAttivi(rows: ActiveTicketJoinRow[], limit: number): ClienteAttivo[] {
  const map = new Map<string, ClienteAttivo>();

  for (const row of rows) {
    if (!row.clienti) continue;

    const existing = map.get(row.cliente_id);
    if (existing) {
      existing.ticketAttivi += 1;
      continue;
    }

    map.set(row.cliente_id, {
      id: row.clienti.id,
      nome: row.clienti.nome,
      tipo: row.clienti.tipo,
      telefono: row.clienti.telefono,
      email: row.clienti.email,
      citta: row.clienti.citta,
      ticketAttivi: 1,
      ultimaAttivita: row.created_at,
    });
  }

  return Array.from(map.values()).slice(0, limit);
}
