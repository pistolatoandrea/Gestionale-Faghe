"use server";

import { createClient } from "@/lib/supabase/server";
import { renderInterventoReportPdf } from "@/lib/intervento-report-pdf";
import type { InterventoStato } from "@/lib/supabase/types";

const FOTO_BUCKET = "intervento-foto";
const REPORT_BUCKET = "intervento-report";

interface InterventoConCliente {
  nome: string;
  luogo: string | null;
  ticket: { clienti: { nome: string } | null } | null;
}

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

export interface UpdateInterventoInput {
  dataOra: string;
  luogo?: string;
  descrizione?: string;
}

export async function updateIntervento(
  interventoId: string,
  input: UpdateInterventoInput
): Promise<{ error: string } | { success: true }> {
  if (!input.dataOra) {
    return { error: "Giorno e ora dell'intervento sono obbligatori." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("interventi")
    .update({
      data_ora: input.dataOra,
      luogo: input.luogo?.trim() || null,
      descrizione: input.descrizione?.trim() || null,
    })
    .eq("id", interventoId);

  if (error) {
    return { error: "Errore nell'aggiornamento dell'intervento: " + error.message };
  }

  return { success: true };
}

export async function deleteIntervento(
  interventoId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error: taskError } = await supabase
    .from("task")
    .delete()
    .eq("entity_type", "intervento")
    .eq("entity_id", interventoId);

  if (taskError) {
    return { error: "Errore nell'eliminazione delle task collegate: " + taskError.message };
  }

  const { data: foto, error: fotoError } = await supabase
    .from("intervento_foto")
    .select("storage_path")
    .eq("intervento_id", interventoId);

  if (fotoError) {
    return { error: "Errore nella lettura delle foto collegate: " + fotoError.message };
  }

  if (foto && foto.length > 0) {
    const { error: removeError } = await supabase.storage
      .from(FOTO_BUCKET)
      .remove(foto.map((f) => f.storage_path));

    if (removeError) {
      return { error: "Errore nell'eliminazione delle foto collegate: " + removeError.message };
    }
  }

  const { data: interventoDaEliminare, error: interventoError } = await supabase
    .from("interventi")
    .select("report_path")
    .eq("id", interventoId)
    .single();

  if (interventoError) {
    return { error: "Errore nella lettura dell'intervento: " + interventoError.message };
  }

  if (interventoDaEliminare?.report_path) {
    const { error: removeReportError } = await supabase.storage
      .from(REPORT_BUCKET)
      .remove([interventoDaEliminare.report_path]);

    if (removeReportError) {
      return { error: "Errore nell'eliminazione del report collegato: " + removeReportError.message };
    }
  }

  const { error } = await supabase.from("interventi").delete().eq("id", interventoId);

  if (error) {
    return { error: "Errore nell'eliminazione dell'intervento: " + error.message };
  }

  return { success: true };
}

export async function recordInterventoFoto(
  interventoId: string,
  storagePath: string,
  nomeFile: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessione scaduta, effettua di nuovo il login." };
  }

  const { error } = await supabase.from("intervento_foto").insert({
    intervento_id: interventoId,
    storage_path: storagePath,
    nome_file: nomeFile,
    created_by: user.id,
  });

  if (error) {
    return { error: "Errore nel salvataggio della foto: " + error.message };
  }

  return { success: true };
}

export async function deleteInterventoFoto(
  fotoId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { data: foto, error: fetchError } = await supabase
    .from("intervento_foto")
    .select("storage_path")
    .eq("id", fotoId)
    .single();

  if (fetchError || !foto) {
    return { error: "Errore nel caricamento della foto: " + fetchError?.message };
  }

  const { error: removeError } = await supabase.storage
    .from(FOTO_BUCKET)
    .remove([foto.storage_path]);

  if (removeError) {
    return { error: "Errore nell'eliminazione del file: " + removeError.message };
  }

  const { error } = await supabase.from("intervento_foto").delete().eq("id", fotoId);

  if (error) {
    return { error: "Errore nell'eliminazione della foto: " + error.message };
  }

  return { success: true };
}

export interface GenerateInterventoReportInput {
  oggetto: string;
  verifiche: string;
  operatore: string;
}

export async function generateInterventoReport(
  interventoId: string,
  input: GenerateInterventoReportInput
): Promise<{ error: string } | { success: true }> {
  const oggetto = input.oggetto.trim();
  const verifiche = input.verifiche.trim();
  const operatore = input.operatore.trim();

  if (!oggetto || !verifiche || !operatore) {
    return { error: "Compila oggetto, verifiche eseguite e nome operatore." };
  }

  const supabase = await createClient();

  const { data: intervento, error: fetchError } = await supabase
    .from("interventi")
    .select("nome, luogo, ticket:ticket_id(clienti(nome))")
    .eq("id", interventoId)
    .single()
    .returns<InterventoConCliente>();

  if (fetchError || !intervento) {
    return { error: "Errore nel caricamento dell'intervento: " + fetchError?.message };
  }

  const dataGenerazione = new Date();

  let buffer: Buffer;
  try {
    buffer = await renderInterventoReportPdf({
      dataGenerazione,
      clienteNome: intervento.ticket?.clienti?.nome ?? null,
      luogo: intervento.luogo,
      oggetto,
      verifiche,
      operatore,
    });
  } catch (renderError) {
    return {
      error: "Errore nella generazione del PDF: " + (renderError as Error).message,
    };
  }

  const path = `${interventoId}/report.pdf`;

  const { error: uploadError } = await supabase.storage.from(REPORT_BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) {
    return { error: "Errore nel caricamento del report: " + uploadError.message };
  }

  const { error: updateError } = await supabase
    .from("interventi")
    .update({
      report_oggetto: oggetto,
      report_verifiche: verifiche,
      report_operatore: operatore,
      report_path: path,
      report_generato_at: dataGenerazione.toISOString(),
    })
    .eq("id", interventoId);

  if (updateError) {
    return { error: "Errore nel salvataggio del report: " + updateError.message };
  }

  return { success: true };
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

export async function moveIntervento(
  interventoId: string,
  dataOra: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("interventi")
    .update({ data_ora: dataOra })
    .eq("id", interventoId);

  if (error) {
    return { error: "Errore nello spostamento dell'intervento: " + error.message };
  }

  return { success: true };
}
