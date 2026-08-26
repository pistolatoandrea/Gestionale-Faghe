"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCliente } from "@/app/(dashboard)/clienti/actions";
import { ClienteFormFields } from "@/components/clienti/cliente-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EMPTY_CLIENTE_DRAFT, type ClienteDraft } from "@/lib/cliente-draft";
import { createClient } from "@/lib/supabase/client";

export function EditClienteDialog({
  open,
  onOpenChange,
  clienteId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string | null;
  onSaved: () => void;
}) {
  const [pending, startSaving] = useTransition();
  const [loading, startFetching] = useTransition();
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClienteDraft>(EMPTY_CLIENTE_DRAFT);

  useEffect(() => {
    if (!open || !clienteId) return;

    let cancelled = false;

    startFetching(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clienti")
        .select("tipo, nome, telefono, email, indirizzo, citta, cap, piva_cf, note")
        .eq("id", clienteId)
        .single();

      if (cancelled) return;
      if (error || !data) {
        toast.error("Errore nel caricamento del cliente.");
        return;
      }
      setDraft({
        tipo: data.tipo,
        nome: data.nome,
        telefono: data.telefono ?? "",
        email: data.email ?? "",
        indirizzo: data.indirizzo ?? "",
        citta: data.citta ?? "",
        cap: data.cap ?? "",
        piva_cf: data.piva_cf ?? "",
        note: data.note ?? "",
      });
      setLoadedId(clienteId);
    });

    return () => {
      cancelled = true;
    };
  }, [open, clienteId]);

  function handleSubmit() {
    if (!clienteId) return;
    if (!draft.nome.trim()) {
      toast.error("Inserisci il nome del cliente.");
      return;
    }

    startSaving(async () => {
      const result = await updateCliente(clienteId, draft);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Cliente aggiornato.");
      onOpenChange(false);
      onSaved();
    });
  }

  const ready = loadedId === clienteId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Modifica Cliente</DialogTitle>
          <DialogDescription>Aggiorna i dati anagrafici del cliente.</DialogDescription>
        </DialogHeader>

        {loading || !ready ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
        ) : (
          <ClienteFormFields value={draft} onChange={setDraft} />
        )}

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending || loading || !ready}>
            {pending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
