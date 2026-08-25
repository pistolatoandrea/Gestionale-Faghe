"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEvento, updateEvento } from "@/app/(dashboard)/calendario/actions";
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
import { toDatetimeLocalValue } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

interface EventoDetail {
  id: string;
  nome: string;
  data_ora: string;
  luogo: string | null;
}

export function EventoDetailDialog({
  open,
  onOpenChange,
  eventoId,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventoId: string | null;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [pending, startSaving] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [loading, startFetching] = useTransition();
  const [evento, setEvento] = useState<EventoDetail | null>(null);

  const [nome, setNome] = useState("");
  const [dataOra, setDataOra] = useState("");
  const [luogo, setLuogo] = useState("");

  useEffect(() => {
    if (!open || !eventoId) return;

    let cancelled = false;

    startFetching(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("eventi")
        .select("id, nome, data_ora, luogo")
        .eq("id", eventoId)
        .single();

      if (cancelled) return;
      if (error || !data) {
        toast.error("Errore nel caricamento dell'evento.");
        return;
      }
      setEvento(data);
      setNome(data.nome);
      setDataOra(toDatetimeLocalValue(data.data_ora));
      setLuogo(data.luogo ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [open, eventoId]);

  function handleSubmit() {
    if (!evento) return;
    if (!nome.trim()) {
      toast.error("Inserisci il nome dell'evento.");
      return;
    }
    if (!dataOra) {
      toast.error("Inserisci data e ora dell'evento.");
      return;
    }

    startSaving(async () => {
      const result = await updateEvento(evento.id, {
        nome,
        dataOra: new Date(dataOra).toISOString(),
        luogo,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Evento aggiornato.");
      onOpenChange(false);
      onSaved();
    });
  }

  async function handleDelete() {
    if (!evento) return;
    if (!window.confirm("Eliminare questo evento? L'operazione non è reversibile.")) {
      return;
    }

    setDeleting(true);
    const result = await deleteEvento(evento.id);
    setDeleting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success("Evento eliminato.");
    onOpenChange(false);
    onDeleted();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{evento?.nome ?? "Evento"}</DialogTitle>
          <DialogDescription>Dettagli dell&apos;evento.</DialogDescription>
        </DialogHeader>

        {loading || !evento ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="evento-detail-nome">Nome evento</Label>
              <Input id="evento-detail-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="evento-detail-data-ora">Data e ora</Label>
              <Input
                id="evento-detail-data-ora"
                type="datetime-local"
                value={dataOra}
                onChange={(e) => setDataOra(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="evento-detail-luogo">Luogo</Label>
              <Input id="evento-detail-luogo" value={luogo} onChange={(e) => setLuogo(e.target.value)} />
            </div>
          </div>
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
          <Button type="button" onClick={handleSubmit} disabled={pending || loading || !evento}>
            {pending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
