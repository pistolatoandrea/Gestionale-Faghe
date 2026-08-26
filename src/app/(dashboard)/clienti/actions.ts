"use server";

import { createClient } from "@/lib/supabase/server";
import type { ClienteDraft } from "@/lib/cliente-draft";

export type CreateClienteResult = { clienteId: string } | { error: string };

export async function createCliente(data: ClienteDraft): Promise<CreateClienteResult> {
  const nome = data.nome.trim();
  if (!nome) {
    return { error: "Il nome è obbligatorio." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessione scaduta, effettua di nuovo il login." };
  }

  const { data: cliente, error } = await supabase
    .from("clienti")
    .insert({
      tipo: data.tipo,
      nome,
      telefono: data.telefono.trim() || null,
      email: data.email.trim() || null,
      indirizzo: data.indirizzo.trim() || null,
      citta: data.citta.trim() || null,
      cap: data.cap.trim() || null,
      piva_cf: data.piva_cf.trim() || null,
      note: data.note.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !cliente) {
    return { error: "Errore nella creazione del cliente: " + error?.message };
  }

  return { clienteId: cliente.id };
}

export async function updateCliente(
  clienteId: string,
  data: ClienteDraft
): Promise<{ error: string } | { success: true }> {
  const nome = data.nome.trim();
  if (!nome) {
    return { error: "Il nome è obbligatorio." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("clienti")
    .update({
      tipo: data.tipo,
      nome,
      telefono: data.telefono.trim() || null,
      email: data.email.trim() || null,
      indirizzo: data.indirizzo.trim() || null,
      citta: data.citta.trim() || null,
      cap: data.cap.trim() || null,
      piva_cf: data.piva_cf.trim() || null,
      note: data.note.trim() || null,
    })
    .eq("id", clienteId);

  if (error) {
    return { error: "Errore nell'aggiornamento del cliente: " + error.message };
  }

  return { success: true };
}

export async function deleteCliente(
  clienteId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { count, error: ticketCountError } = await supabase
    .from("ticket")
    .select("id", { count: "exact", head: true })
    .eq("cliente_id", clienteId);

  if (ticketCountError) {
    return { error: "Errore nel controllo dei ticket collegati: " + ticketCountError.message };
  }

  if (count && count > 0) {
    return {
      error: `Impossibile eliminare: il cliente ha ${count} ticket collegat${count === 1 ? "o" : "i"}. Elimina prima i ticket.`,
    };
  }

  const { error: taskError } = await supabase
    .from("task")
    .delete()
    .eq("entity_type", "cliente")
    .eq("entity_id", clienteId);

  if (taskError) {
    return { error: "Errore nell'eliminazione delle task collegate: " + taskError.message };
  }

  const { error } = await supabase.from("clienti").delete().eq("id", clienteId);

  if (error) {
    return { error: "Errore nell'eliminazione del cliente: " + error.message };
  }

  return { success: true };
}
