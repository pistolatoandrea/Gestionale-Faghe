"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteIntervento } from "@/app/(dashboard)/interventi/actions";
import { InterventoDetailDialog } from "@/components/interventi/intervento-detail-dialog";
import { Badge } from "@/components/ui/badge";
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
import { interventoStatoBadgeClassName, interventoStatoLabel } from "@/lib/intervento-status";
import { createClient } from "@/lib/supabase/client";
import type { InterventoStato } from "@/lib/supabase/types";

interface InterventoInfo {
  id: string;
  nome: string;
  luogo: string | null;
  data_ora: string;
  stato: InterventoStato;
  descrizione: string | null;
  ticket: {
    id: string;
    numero: number;
    titolo: string;
    clienti: { id: string; nome: string } | null;
  } | null;
}

export function InterventoInfoDialog({
  open,
  onOpenChange,
  interventoId,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interventoId: string | null;
  onChanged: () => void;
}) {
  const [loading, startFetching] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [intervento, setIntervento] = useState<InterventoInfo | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!open || !interventoId) return;

    let cancelled = false;

    startFetching(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("interventi")
        .select(
          "id, nome, luogo, data_ora, stato, descrizione, ticket:ticket_id(id, numero, titolo, clienti(id, nome))"
        )
        .eq("id", interventoId)
        .single()
        .returns<InterventoInfo>();

      if (cancelled) return;
      if (error || !data) {
        toast.error("Errore nel caricamento dell'intervento.");
        return;
      }
      setIntervento(data);
    });

    return () => {
      cancelled = true;
    };
  }, [open, interventoId]);

  function handleModifica() {
    onOpenChange(false);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!intervento) return;
    if (
      !window.confirm(
        "Eliminare questo intervento? Verranno eliminate anche le task collegate. L'operazione non è reversibile."
      )
    ) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteIntervento(intervento.id);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Intervento eliminato.");
      onOpenChange(false);
      onChanged();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{intervento?.nome ?? "Intervento"}</DialogTitle>
            <DialogDescription>Dettagli dell&apos;intervento.</DialogDescription>
          </DialogHeader>

          {loading || !intervento ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Stato</dt>
                <dd>
                  <Badge className={interventoStatoBadgeClassName(intervento.stato)}>
                    {interventoStatoLabel(intervento.stato)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Giorno e ora</dt>
                <dd>{formatDateTimeIT(intervento.data_ora)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Ticket</dt>
                <dd>
                  {intervento.ticket ? (
                    <Link href={`/ticket/${intervento.ticket.id}`} className="text-primary hover:underline">
                      #{intervento.ticket.numero} — {intervento.ticket.titolo}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Cliente</dt>
                <dd>
                  {intervento.ticket?.clienti ? (
                    <Link
                      href={`/clienti/${intervento.ticket.clienti.id}`}
                      className="text-primary hover:underline"
                    >
                      {intervento.ticket.clienti.nome}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Luogo</dt>
                <dd>{intervento.luogo ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Descrizione</dt>
                <dd className="whitespace-pre-wrap">{intervento.descrizione ?? "—"}</dd>
              </div>
            </dl>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading || !intervento}
            >
              {deleting ? "Eliminazione..." : "Elimina"}
            </Button>
            <Button type="button" onClick={handleModifica} disabled={loading || !intervento}>
              Modifica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InterventoDetailDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        interventoId={interventoId}
        onSaved={onChanged}
      />
    </>
  );
}
