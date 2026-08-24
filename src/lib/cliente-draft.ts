import type { ClienteTipo } from "@/lib/supabase/types";

export interface ClienteDraft {
  tipo: ClienteTipo;
  nome: string;
  telefono: string;
  email: string;
  indirizzo: string;
  citta: string;
  cap: string;
  piva_cf: string;
  note: string;
}

export const EMPTY_CLIENTE_DRAFT: ClienteDraft = {
  tipo: "privato",
  nome: "",
  telefono: "",
  email: "",
  indirizzo: "",
  citta: "",
  cap: "",
  piva_cf: "",
  note: "",
};

export const CLIENTE_TIPO_LABELS: Record<ClienteTipo, string> = {
  privato: "Privato",
  azienda: "Azienda",
};
