"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEvento } from "@/app/(dashboard)/calendario/actions";
import { EventoDetailDialog } from "@/components/calendario/evento-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTimeIT } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

interface EventoInfo {
  id: string;
  nome: string;
  data_ora: string;
  luogo: string | null;
  note: string | null;
}

export function EventoInfoDialog({
  open,
  onOpenChange,
  eventoId,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventoId: string | null;
  onChanged: () => void;
}) {
  const [loading, startFetching] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [evento, setEvento] = useState<EventoInfo | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!open || !eventoId) return;

    let cancelled = false;

    startFetching(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("eventi")
        .select("id, nome, data_ora, luogo, note")
        .eq("id", eventoId)
        .single();

      if (cancelled) return;
      if (error || !data) {
        toast.error("Errore nel caricamento dell'evento.");
        return;
      }
      setEvento(data);
    });

    return () => {
      cancelled = true;
    };
  }, [open, eventoId]);

  function handleModifica() {
    onOpenChange(false);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!evento) return;
    if (!window.confirm("Eliminare questo evento? L'operazione non è reversibile.")) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteEvento(evento.id);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Evento eliminato.");
      onOpenChange(false);
      onChanged();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{evento?.nome ?? "Evento"}</DialogTitle>
            <DialogDescription>Dettagli dell&apos;evento.</DialogDescription>
          </DialogHeader>

          {loading || !evento ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Data e ora</dt>
                <dd>{formatDateTimeIT(evento.data_ora)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Luogo</dt>
                <dd>{evento.luogo ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Note</dt>
                <dd className="whitespace-pre-wrap">{evento.note ?? "—"}</dd>
              </div>
            </dl>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading || !evento}
            >
              {deleting ? "Eliminazione..." : "Elimina"}
            </Button>
            <Button type="button" onClick={handleModifica} disabled={loading || !evento}>
              Modifica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EventoDetailDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        eventoId={eventoId}
        onSaved={onChanged}
        onDeleted={onChanged}
      />
    </>
  );
}
