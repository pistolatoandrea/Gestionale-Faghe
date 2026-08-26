"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createEvento } from "@/app/(dashboard)/calendario/actions";
import { createIntervento } from "@/app/(dashboard)/interventi/actions";
import { createTask } from "@/app/(dashboard)/task/actions";
import { ClientCombobox, type ClienteOption } from "@/components/ticket/client-combobox";
import { TicketCombobox, type TicketOption } from "@/components/ticket/ticket-combobox";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDateOnlyValue } from "@/lib/format";

type NuovoEventoTipo = "intervento" | "task" | "evento";
type TaskLinkTipo = "ticket" | "cliente";
type LuogoModalita = "cliente" | "nuovo";

function formatIndirizzoCliente(cliente: TicketOption["cliente"]): string {
  if (!cliente) return "";
  const via = cliente.indirizzo?.trim();
  const cittaCap = [cliente.cap?.trim(), cliente.citta?.trim()].filter(Boolean).join(" ");
  return [via, cittaCap].filter(Boolean).join(", ");
}

export function NewEventDialog({
  open,
  onOpenChange,
  initialDataOra,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDataOra: string;
  onCreated: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const [tipo, setTipo] = useState<NuovoEventoTipo>("intervento");

  const [nome, setNome] = useState("");
  const [dataOra, setDataOra] = useState(initialDataOra);
  const [luogo, setLuogo] = useState("");
  const [note, setNote] = useState("");

  const [ticket, setTicket] = useState<TicketOption | null>(null);
  const [luogoModalita, setLuogoModalita] = useState<LuogoModalita>("cliente");
  const [interventoDescrizione, setInterventoDescrizione] = useState("");

  const [titolo, setTitolo] = useState("");
  const [taskLinkTipo, setTaskLinkTipo] = useState<TaskLinkTipo>("ticket");
  const [taskTicket, setTaskTicket] = useState<TicketOption | null>(null);
  const [taskCliente, setTaskCliente] = useState<ClienteOption | null>(null);
  const [scadenza, setScadenza] = useState(
    toDateOnlyValue(initialDataOra ? new Date(initialDataOra) : new Date())
  );
  const [taskDescrizione, setTaskDescrizione] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTipo("intervento");
      setNome("");
      setDataOra(initialDataOra);
      setLuogo("");
      setNote("");
      setTicket(null);
      setLuogoModalita("cliente");
      setInterventoDescrizione("");
      setTitolo("");
      setTaskLinkTipo("ticket");
      setTaskTicket(null);
      setTaskCliente(null);
      setScadenza(toDateOnlyValue(initialDataOra ? new Date(initialDataOra) : new Date()));
      setTaskDescrizione("");
    }
  }

  function handleSelectTicket(t: TicketOption) {
    setTicket(t);
    if (luogoModalita === "cliente") {
      setLuogo(formatIndirizzoCliente(t.cliente));
    }
  }

  function handleLuogoModalitaChange(value: LuogoModalita) {
    if (!ticket) {
      toast.error("Seleziona prima il ticket collegato.");
      return;
    }
    setLuogoModalita(value);
    setLuogo(value === "cliente" ? formatIndirizzoCliente(ticket.cliente) : "");
  }

  function handleSubmit() {
    if (tipo === "evento") {
      if (!nome.trim()) {
        toast.error("Inserisci il nome dell'evento.");
        return;
      }
      if (!dataOra) {
        toast.error("Inserisci data e ora dell'evento.");
        return;
      }

      startTransition(async () => {
        const result = await createEvento({
          nome,
          dataOra: new Date(dataOra).toISOString(),
          luogo,
          note,
        });

        if ("error" in result) {
          toast.error(result.error);
          return;
        }

        toast.success("Evento creato.");
        onOpenChange(false);
        onCreated();
      });
      return;
    }

    if (tipo === "intervento") {
      if (!ticket) {
        toast.error("Seleziona il ticket collegato.");
        return;
      }
      if (!dataOra) {
        toast.error("Inserisci giorno e ora dell'intervento.");
        return;
      }

      startTransition(async () => {
        const result = await createIntervento({
          ticketId: ticket.id,
          dataOra: new Date(dataOra).toISOString(),
          luogo,
          descrizione: interventoDescrizione,
        });

        if ("error" in result) {
          toast.error(result.error);
          return;
        }

        toast.success("Intervento creato.");
        onOpenChange(false);
        onCreated();
      });
      return;
    }

    if (!titolo.trim()) {
      toast.error("Inserisci un titolo per la task.");
      return;
    }
    const entity = taskLinkTipo === "ticket" ? taskTicket : taskCliente;
    if (!entity) {
      toast.error(
        taskLinkTipo === "ticket" ? "Seleziona il ticket collegato." : "Seleziona il cliente collegato."
      );
      return;
    }

    startTransition(async () => {
      const result = await createTask({
        titolo,
        descrizione: taskDescrizione,
        scadenza: scadenza || undefined,
        entityType: taskLinkTipo,
        entityId: entity.id,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Task creata.");
      onOpenChange(false);
      onCreated();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuovo Evento</DialogTitle>
          <DialogDescription>Scegli il tipo di evento da creare sul calendario.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as NuovoEventoTipo)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intervento">Intervento</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="evento">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === "evento" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-evento-nome">Nome evento</Label>
                <Input
                  id="nuovo-evento-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Es. Sopralluogo Via Roma"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-evento-data-ora">Data e ora</Label>
                <Input
                  id="nuovo-evento-data-ora"
                  type="datetime-local"
                  value={dataOra}
                  onChange={(e) => setDataOra(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-evento-luogo">Luogo</Label>
                <Input id="nuovo-evento-luogo" value={luogo} onChange={(e) => setLuogo(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-evento-note">Note</Label>
                <Textarea
                  id="nuovo-evento-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {tipo === "intervento" && (
            <>
              <div className="flex flex-col gap-2">
                <Label>Ticket collegato</Label>
                <TicketCombobox value={ticket} onSelect={handleSelectTicket} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-intervento-data-ora">Giorno e ora</Label>
                <Input
                  id="nuovo-intervento-data-ora"
                  type="datetime-local"
                  value={dataOra}
                  onChange={(e) => setDataOra(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Luogo</Label>
                <RadioGroup
                  value={luogoModalita}
                  onValueChange={(v) => handleLuogoModalitaChange(v as LuogoModalita)}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cliente" id="nuovo-intervento-luogo-cliente" />
                    <Label htmlFor="nuovo-intervento-luogo-cliente" className="cursor-pointer font-normal">
                      Stesso indirizzo del cliente
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nuovo" id="nuovo-intervento-luogo-nuovo" />
                    <Label htmlFor="nuovo-intervento-luogo-nuovo" className="cursor-pointer font-normal">
                      Nuovo indirizzo
                    </Label>
                  </div>
                </RadioGroup>

                {luogoModalita === "cliente" ? (
                  <p className="text-sm text-muted-foreground">
                    {!ticket
                      ? "Seleziona prima il ticket collegato."
                      : (luogo || "Nessun indirizzo disponibile per questo cliente.")}
                  </p>
                ) : (
                  <Input
                    id="nuovo-intervento-luogo"
                    value={luogo}
                    onChange={(e) => setLuogo(e.target.value)}
                    placeholder="Indirizzo dell'intervento"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-intervento-descrizione">Descrizione</Label>
                <Textarea
                  id="nuovo-intervento-descrizione"
                  value={interventoDescrizione}
                  onChange={(e) => setInterventoDescrizione(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {tipo === "task" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-task-titolo">Titolo</Label>
                <Input
                  id="nuovo-task-titolo"
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                  placeholder="Es. Richiamare il cliente per conferma orario"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Collegata a</Label>
                <Select value={taskLinkTipo} onValueChange={(v) => setTaskLinkTipo(v as TaskLinkTipo)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{taskLinkTipo === "ticket" ? "Ticket" : "Cliente"}</Label>
                {taskLinkTipo === "ticket" ? (
                  <TicketCombobox value={taskTicket} onSelect={setTaskTicket} />
                ) : (
                  <ClientCombobox value={taskCliente} onSelect={setTaskCliente} />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-task-scadenza">Scadenza</Label>
                <Input
                  id="nuovo-task-scadenza"
                  type="date"
                  value={scadenza}
                  onChange={(e) => setScadenza(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="nuovo-task-descrizione">Descrizione</Label>
                <Textarea
                  id="nuovo-task-descrizione"
                  value={taskDescrizione}
                  onChange={(e) => setTaskDescrizione(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? "Creazione..." : "Crea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
