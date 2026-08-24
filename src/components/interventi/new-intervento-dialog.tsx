"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { createIntervento } from "@/app/(dashboard)/interventi/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewInterventoDialog({
  ticketId,
  ticketLabel,
}: {
  ticketId: string;
  ticketLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [dataOra, setDataOra] = useState("");
  const [luogo, setLuogo] = useState("");
  const [descrizione, setDescrizione] = useState("");

  function resetForm() {
    setDataOra("");
    setLuogo("");
    setDescrizione("");
  }

  function handleSubmit() {
    if (!dataOra) {
      toast.error("Inserisci giorno e ora dell'intervento.");
      return;
    }

    startTransition(async () => {
      const result = await createIntervento({
        ticketId,
        dataOra: new Date(dataOra).toISOString(),
        luogo,
        descrizione,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Intervento creato.");
      setOpen(false);
      resetForm();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>
        <CalendarPlus className="size-4" />
        Nuovo Intervento
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuovo Intervento</DialogTitle>
          <DialogDescription>Collegato a: {ticketLabel}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="intervento-data-ora">Giorno e ora</Label>
            <Input
              id="intervento-data-ora"
              type="datetime-local"
              value={dataOra}
              onChange={(e) => setDataOra(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="intervento-luogo">Luogo</Label>
            <Input
              id="intervento-luogo"
              value={luogo}
              onChange={(e) => setLuogo(e.target.value)}
              placeholder="Indirizzo dell'intervento"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="intervento-descrizione">Descrizione</Label>
            <Textarea
              id="intervento-descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? "Creazione..." : "Crea Intervento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
