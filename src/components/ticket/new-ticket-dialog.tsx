"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createTicket } from "@/app/(dashboard)/ticket/actions";
import { ClientCombobox, type ClienteOption } from "@/components/ticket/client-combobox";
import { ClienteFormFields } from "@/components/clienti/cliente-form-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { EMPTY_CLIENTE_DRAFT, type ClienteDraft } from "@/lib/cliente-draft";
import {
  TICKET_QUESTIONARIO,
  generaNoteDaRisposte,
  generaTitoloDaRisposte,
} from "@/lib/ticket-questionario";

const ULTIMO_STEP = TICKET_QUESTIONARIO.length;

export function NewTicketDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(0);

  const [cliente, setCliente] = useState<ClienteOption | null>(null);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const [newCliente, setNewCliente] = useState<ClienteDraft>(EMPTY_CLIENTE_DRAFT);

  const [risposte, setRisposte] = useState<Record<string, string[]>>({});

  const [titolo, setTitolo] = useState("");
  const [note, setNote] = useState("");

  function resetForm() {
    setStep(0);
    setCliente(null);
    setCreatingCliente(false);
    setNewCliente(EMPTY_CLIENTE_DRAFT);
    setRisposte({});
    setTitolo("");
    setNote("");
  }

  function toggleRisposta(slug: string, value: string) {
    setRisposte((prev) => {
      const attuali = prev[slug] ?? [];
      const prossime = attuali.includes(value)
        ? attuali.filter((v) => v !== value)
        : [...attuali, value];
      return { ...prev, [slug]: prossime };
    });
  }

  function canGoNext(): boolean {
    const domanda = TICKET_QUESTIONARIO[step];
    if (domanda) {
      return (risposte[domanda.slug] ?? []).length > 0;
    }
    return true;
  }

  function handleNext() {
    if (!canGoNext()) {
      toast.error("Seleziona almeno una risposta.");
      return;
    }

    const prossimoStep = step + 1;
    if (prossimoStep === ULTIMO_STEP) {
      setTitolo(generaTitoloDaRisposte(risposte));
      setNote(generaNoteDaRisposte(risposte));
    }
    setStep(prossimoStep);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleSubmit() {
    if (creatingCliente ? !newCliente.nome.trim() : !cliente) {
      toast.error("Seleziona o crea un cliente.");
      return;
    }
    if (!titolo.trim()) {
      toast.error("Inserisci un titolo per il ticket.");
      return;
    }

    startTransition(async () => {
      const result = creatingCliente
        ? await createTicket({
            titolo,
            note,
            questionario: risposte,
            cliente: { mode: "new", data: newCliente },
          })
        : await createTicket({
            titolo,
            note,
            questionario: risposte,
            cliente: { mode: "existing", id: cliente!.id },
          });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Ticket creato.");
      setOpen(false);
      resetForm();
      router.refresh();
    });
  }

  const domandaCorrente = step < TICKET_QUESTIONARIO.length ? TICKET_QUESTIONARIO[step] : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Nuovo Ticket
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuovo Ticket</DialogTitle>
          <DialogDescription>
            {domandaCorrente
              ? `Domanda ${step + 1} di ${TICKET_QUESTIONARIO.length}`
              : "Seleziona il cliente e controlla titolo e note, poi crea il ticket."}
          </DialogDescription>
        </DialogHeader>

        {domandaCorrente && (
          <div className="flex flex-col gap-3">
            <Label>{domandaCorrente.domanda}</Label>
            <div className="flex flex-col gap-2">
              {domandaCorrente.opzioni.map((opzione) => {
                const checked = (risposte[domandaCorrente.slug] ?? []).includes(opzione.value);
                const id = `${domandaCorrente.slug}-${opzione.value}`;
                return (
                  <div key={opzione.value} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggleRisposta(domandaCorrente.slug, opzione.value)}
                    />
                    <Label htmlFor={id} className="cursor-pointer font-normal">
                      {opzione.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === ULTIMO_STEP && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Cliente</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => {
                    setCreatingCliente((v) => !v);
                    setCliente(null);
                  }}
                >
                  {creatingCliente ? "Cerca cliente esistente" : "Cliente non trovato? Crea nuovo"}
                </Button>
              </div>

              {creatingCliente ? (
                <div className="rounded-lg border p-3">
                  <ClienteFormFields value={newCliente} onChange={setNewCliente} />
                </div>
              ) : (
                <ClientCombobox value={cliente} onSelect={setCliente} />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ticket-titolo">Titolo</Label>
              <Input id="ticket-titolo" value={titolo} onChange={(e) => setTitolo(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ticket-note">Note</Label>
              <Textarea
                id="ticket-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 0 && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={pending}>
              Indietro
            </Button>
          )}
          {step === ULTIMO_STEP ? (
            <Button type="button" onClick={handleSubmit} disabled={pending}>
              {pending ? "Creazione..." : "Crea Ticket"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Avanti
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
