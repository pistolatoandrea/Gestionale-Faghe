"use server";

import { createClient } from "@/lib/supabase/server";
import type { ClienteTipo, TicketStato } from "@/lib/supabase/types";

interface NuovoClienteInput {
  tipo: ClienteTipo;
  nome: string;
  telefono?: string;
  email?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  piva_cf?: string;
  note?: string;
}

export type CreateTicketInput =
  | {
      titolo: string;
      note?: string;
      questionario?: Record<string, string[]>;
      cliente: { mode: "existing"; id: string };
    }
  | {
      titolo: string;
      note?: string;
      questionario?: Record<string, string[]>;
      cliente: { mode: "new"; data: NuovoClienteInput };
    };

export type CreateTicketResult = { ticketId: string } | { error: string };

export async function createTicket(input: CreateTicketInput): Promise<CreateTicketResult> {
  if (!input.titolo.trim()) {
    return { error: "Il titolo è obbligatorio." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessione scaduta, effettua di nuovo il login." };
  }

  let clienteId: string;

  if (input.cliente.mode === "existing") {
    clienteId = input.cliente.id;
  } else {
    const nome = input.cliente.data.nome.trim();
    if (!nome) {
      return { error: "Il nome del cliente è obbligatorio." };
    }

    const { data: nuovoCliente, error: clienteError } = await supabase
      .from("clienti")
      .insert({
        tipo: input.cliente.data.tipo,
        nome,
        telefono: input.cliente.data.telefono || null,
        email: input.cliente.data.email || null,
        indirizzo: input.cliente.data.indirizzo || null,
        citta: input.cliente.data.citta || null,
        cap: input.cliente.data.cap || null,
        piva_cf: input.cliente.data.piva_cf || null,
        note: input.cliente.data.note || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (clienteError || !nuovoCliente) {
      return { error: "Errore nella creazione del cliente: " + clienteError?.message };
    }

    clienteId = nuovoCliente.id;
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("ticket")
    .insert({
      titolo: input.titolo.trim(),
      descrizione: input.note?.trim() || null,
      cliente_id: clienteId,
      questionario: input.questionario ?? {},
      created_by: user.id,
    })
    .select("id")
    .single();

  if (ticketError || !ticket) {
    return { error: "Errore nella creazione del ticket: " + ticketError?.message };
  }

  return { ticketId: ticket.id };
}

export async function updateTicketStato(
  ticketId: string,
  stato: TicketStato
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase.from("ticket").update({ stato }).eq("id", ticketId);

  if (error) {
    return { error: "Errore nell'aggiornamento dello stato: " + error.message };
  }

  return { success: true };
}

export interface UpdateTicketInput {
  titolo: string;
  descrizione?: string;
}

export async function updateTicket(
  ticketId: string,
  input: UpdateTicketInput
): Promise<{ error: string } | { success: true }> {
  const titolo = input.titolo.trim();
  if (!titolo) {
    return { error: "Il titolo è obbligatorio." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("ticket")
    .update({
      titolo,
      descrizione: input.descrizione?.trim() || null,
    })
    .eq("id", ticketId);

  if (error) {
    return { error: "Errore nell'aggiornamento del ticket: " + error.message };
  }

  return { success: true };
}

export async function updateTicketChecklistItem(
  ticketId: string,
  slug: string,
  checked: boolean
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { data: ticket, error: fetchError } = await supabase
    .from("ticket")
    .select("checklist")
    .eq("id", ticketId)
    .single();

  if (fetchError || !ticket) {
    return { error: "Errore nel caricamento della checklist: " + fetchError?.message };
  }

  const checklist = { ...ticket.checklist, [slug]: checked };

  const { error } = await supabase.from("ticket").update({ checklist }).eq("id", ticketId);

  if (error) {
    return { error: "Errore nell'aggiornamento della checklist: " + error.message };
  }

  return { success: true };
}

export async function deleteTicket(
  ticketId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { data: interventi, error: interventiError } = await supabase
    .from("interventi")
    .select("id")
    .eq("ticket_id", ticketId);

  if (interventiError) {
    return { error: "Errore nella lettura degli interventi collegati: " + interventiError.message };
  }

  const interventoIds = (interventi ?? []).map((i) => i.id);

  const { error: taskTicketError } = await supabase
    .from("task")
    .delete()
    .eq("entity_type", "ticket")
    .eq("entity_id", ticketId);

  if (taskTicketError) {
    return { error: "Errore nell'eliminazione delle task collegate: " + taskTicketError.message };
  }

  if (interventoIds.length > 0) {
    const { error: taskInterventoError } = await supabase
      .from("task")
      .delete()
      .eq("entity_type", "intervento")
      .in("entity_id", interventoIds);

    if (taskInterventoError) {
      return { error: "Errore nell'eliminazione delle task collegate: " + taskInterventoError.message };
    }
  }

  const { error } = await supabase.from("ticket").delete().eq("id", ticketId);

  if (error) {
    return { error: "Errore nell'eliminazione del ticket: " + error.message };
  }

  return { success: true };
}
