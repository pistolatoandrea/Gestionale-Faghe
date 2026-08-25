"use server";

import { createClient } from "@/lib/supabase/server";
import type { TaskEntityType, TaskStato } from "@/lib/supabase/types";

export interface CreateTaskInput {
  titolo: string;
  descrizione?: string;
  scadenza?: string;
  entityType: TaskEntityType;
  entityId: string;
}

export type CreateTaskResult = { taskId: string } | { error: string };

export async function createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
  const titolo = input.titolo.trim();
  if (!titolo) {
    return { error: "Il titolo è obbligatorio." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessione scaduta, effettua di nuovo il login." };
  }

  const { data: task, error } = await supabase
    .from("task")
    .insert({
      titolo,
      descrizione: input.descrizione?.trim() || null,
      scadenza: input.scadenza || null,
      entity_type: input.entityType,
      entity_id: input.entityId,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !task) {
    return { error: "Errore nella creazione della task: " + error?.message };
  }

  return { taskId: task.id };
}

export interface UpdateTaskInput {
  titolo: string;
  descrizione?: string;
  scadenza?: string | null;
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput
): Promise<{ error: string } | { success: true }> {
  const titolo = input.titolo.trim();
  if (!titolo) {
    return { error: "Il titolo è obbligatorio." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("task")
    .update({
      titolo,
      descrizione: input.descrizione?.trim() || null,
      scadenza: input.scadenza || null,
    })
    .eq("id", taskId);

  if (error) {
    return { error: "Errore nell'aggiornamento della task: " + error.message };
  }

  return { success: true };
}

export async function updateTaskStato(
  taskId: string,
  stato: TaskStato
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase.from("task").update({ stato }).eq("id", taskId);

  if (error) {
    return { error: "Errore nell'aggiornamento dello stato: " + error.message };
  }

  return { success: true };
}

export async function moveTaskScadenza(
  taskId: string,
  scadenza: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const { error } = await supabase.from("task").update({ scadenza }).eq("id", taskId);

  if (error) {
    return { error: "Errore nello spostamento della scadenza: " + error.message };
  }

  return { success: true };
}
