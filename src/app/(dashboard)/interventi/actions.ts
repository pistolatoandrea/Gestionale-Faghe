"use server";

import { createClient } from "@/lib/supabase/server";
import type { InterventoStato } from "@/lib/supabase/types";

export interface CreateInterventoInput {
  ticketId: string;
  dataOra: string;
  luogo?: string;
  descrizione?: string;
}

export type CreateInterventoResult = { interventoId: string } | { error: string };

export async function createIntervento(
  input: CreateInterventoInput
): Promise<CreateInterventoResult> {
  if (!input.dataOra) {
    return { error: "Giorno e ora dell'intervento sono obbligatori." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessione scaduta, effettua di nuovo il login." };
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("ticket")
    .select("titolo")
    .eq("id", input.ticketId)
    .single();

  if (ticketError || !ticket) {
    return { error: "Ticket non trovato." };
  }

  const { count } = await supabase
    .from("interventi")
    .select("id", { count: "exact", head: true })
    .eq("ticket_id", input.ticketId);

  const numeroProgressivo = (count ?? 0) + 1;
  const nome = `${ticket.titolo} - intervento #${numeroProgressivo}`;

  const { data: intervento, error } = await supabase
    .from("interventi")
    .insert({
      ticket_id: input.ticketId,
      nome,
      data_ora: input.dataOra,
      luogo: input.luogo?.trim() || null,
      descrizione: input.descrizione?.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !intervento) {
    return { error: "Errore nella creazione dell'intervento: " + error?.message };
  }

  return { interventoId: intervento.id };
}

export async function updateInterventoStato(
  interventoId: string,
  stato: InterventoStato
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase.from("interventi").update({ stato }).eq("id", interventoId);

  if (error) {
    return { error: "Errore nell'aggiornamento dello stato: " + error.message };
  }

  return { success: true };
}
