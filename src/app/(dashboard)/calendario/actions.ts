"use server";

import { createClient } from "@/lib/supabase/server";

export interface EventoInput {
  nome: string;
  dataOra: string;
  luogo?: string;
}

export type EventoResult = { eventoId: string } | { error: string };

export async function createEvento(input: EventoInput): Promise<EventoResult> {
  const nome = input.nome.trim();
  if (!nome || !input.dataOra) {
    return { error: "Nome evento e data/ora sono obbligatori." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessione scaduta, effettua di nuovo il login." };
  }

  const { data: evento, error } = await supabase
    .from("eventi")
    .insert({
      nome,
      data_ora: input.dataOra,
      luogo: input.luogo?.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !evento) {
    return { error: "Errore nella creazione dell'evento: " + error?.message };
  }

  return { eventoId: evento.id };
}

export async function updateEvento(
  eventoId: string,
  input: EventoInput
): Promise<EventoResult> {
  const nome = input.nome.trim();
  if (!nome || !input.dataOra) {
    return { error: "Nome evento e data/ora sono obbligatori." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("eventi")
    .update({
      nome,
      data_ora: input.dataOra,
      luogo: input.luogo?.trim() || null,
    })
    .eq("id", eventoId);

  if (error) {
    return { error: "Errore nell'aggiornamento dell'evento: " + error.message };
  }

  return { eventoId };
}

export async function moveEvento(
  eventoId: string,
  dataOra: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase.from("eventi").update({ data_ora: dataOra }).eq("id", eventoId);

  if (error) {
    return { error: "Errore nello spostamento dell'evento: " + error.message };
  }

  return { success: true };
}

export async function deleteEvento(
  eventoId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase.from("eventi").delete().eq("id", eventoId);

  if (error) {
    return { error: "Errore nell'eliminazione dell'evento: " + error.message };
  }

  return { success: true };
}
