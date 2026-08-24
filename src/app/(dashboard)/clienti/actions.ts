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
