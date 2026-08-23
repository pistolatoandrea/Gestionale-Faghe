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
      cliente: { mode: "existing"; id: string };
    }
  | {
      titolo: string;
      note?: string;
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
