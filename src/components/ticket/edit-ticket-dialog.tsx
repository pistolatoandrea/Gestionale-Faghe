"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTicket } from "@/app/(dashboard)/ticket/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface TicketEditData {
  titolo: string;
  descrizione: string | null;
}

export function EditTicketDialog({
  open,
  onOpenChange,
  ticketId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string | null;
  onSaved: () => void;
}) {
  const [pending, startSaving] = useTransition();
  const [loading, startFetching] = useTransition();
  const [ticket, setTicket] = useState<TicketEditData | null>(null);

  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");

  useEffect(() => {
    if (!open || !ticketId) return;

    let cancelled = false;

    startFetching(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ticket")
        .select("titolo, descrizione")
        .eq("id", ticketId)
        .single();

      if (cancelled) return;
      if (error || !data) {
        toast.error("Errore nel caricamento del ticket.");
        return;
      }
      setTicket(data);
      setTitolo(data.titolo);
      setDescrizione(data.descrizione ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [open, ticketId]);

  function handleSubmit() {
    if (!ticketId) return;
    if (!titolo.trim()) {
      toast.error("Inserisci un titolo per il ticket.");
      return;
    }

    startSaving(async () => {
      const result = await updateTicket(ticketId, { titolo, descrizione });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Ticket aggiornato.");
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Modifica Ticket</DialogTitle>
          <DialogDescription>Aggiorna titolo e note del ticket.</DialogDescription>
        </DialogHeader>

        {loading || !ticket ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-ticket-titolo">Titolo</Label>
              <Input
                id="edit-ticket-titolo"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-ticket-note">Note</Label>
              <Textarea
                id="edit-ticket-note"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending || loading || !ticket}>
            {pending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
