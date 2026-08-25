"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updateIntervento } from "@/app/(dashboard)/interventi/actions";
import { InterventoStatusPopover } from "@/components/interventi/intervento-status-popover";
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
import { toDatetimeLocalValue } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { InterventoStato } from "@/lib/supabase/types";

interface InterventoDetail {
  id: string;
  nome: string;
  luogo: string | null;
  data_ora: string;
  stato: InterventoStato;
  descrizione: string | null;
  ticket: { id: string; numero: number; titolo: string } | null;
}

export function InterventoDetailDialog({
  open,
  onOpenChange,
  interventoId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interventoId: string | null;
  onSaved: () => void;
}) {
  const [pending, startSaving] = useTransition();
  const [loading, startFetching] = useTransition();
  const [intervento, setIntervento] = useState<InterventoDetail | null>(null);

  const [dataOra, setDataOra] = useState("");
  const [luogo, setLuogo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [stato, setStato] = useState<InterventoStato>("da_fare");

  useEffect(() => {
    if (!open || !interventoId) return;

    let cancelled = false;

    startFetching(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("interventi")
        .select("id, nome, luogo, data_ora, stato, descrizione, ticket:ticket_id(id, numero, titolo)")
        .eq("id", interventoId)
        .single()
        .returns<InterventoDetail>();

      if (cancelled) return;
      if (error || !data) {
        toast.error("Errore nel caricamento dell'intervento.");
        return;
      }
      setIntervento(data);
      setDataOra(toDatetimeLocalValue(data.data_ora));
      setLuogo(data.luogo ?? "");
      setDescrizione(data.descrizione ?? "");
      setStato(data.stato);
    });

    return () => {
      cancelled = true;
    };
  }, [open, interventoId]);

  function handleSubmit() {
    if (!intervento) return;
    if (!dataOra) {
      toast.error("Inserisci giorno e ora dell'intervento.");
      return;
    }

    startSaving(async () => {
      const result = await updateIntervento(intervento.id, {
        dataOra: new Date(dataOra).toISOString(),
        luogo,
        descrizione,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Intervento aggiornato.");
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{intervento?.nome ?? "Intervento"}</DialogTitle>
          <DialogDescription>
            {intervento?.ticket ? (
              <>
                Collegato a{" "}
                <Link href={`/ticket/${intervento.ticket.id}`} className="text-primary hover:underline">
                  ticket #{intervento.ticket.numero} — {intervento.ticket.titolo}
                </Link>
              </>
            ) : (
              "Dettagli dell'intervento."
            )}
          </DialogDescription>
        </DialogHeader>

        {loading || !intervento ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label>Stato</Label>
              <InterventoStatusPopover interventoId={intervento.id} stato={stato} onChange={setStato} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="intervento-detail-data-ora">Giorno e ora</Label>
              <Input
                id="intervento-detail-data-ora"
                type="datetime-local"
                value={dataOra}
                onChange={(e) => setDataOra(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="intervento-detail-luogo">Luogo</Label>
              <Input
                id="intervento-detail-luogo"
                value={luogo}
                onChange={(e) => setLuogo(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="intervento-detail-descrizione">Descrizione</Label>
              <Textarea
                id="intervento-detail-descrizione"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending || loading || !intervento}>
            {pending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
