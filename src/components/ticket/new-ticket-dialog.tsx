"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createTicket } from "@/app/(dashboard)/ticket/actions";
import { ClientCombobox, type ClienteOption } from "@/components/ticket/client-combobox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClienteTipo } from "@/lib/supabase/types";

interface NewClienteDraft {
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

const EMPTY_NEW_CLIENTE: NewClienteDraft = {
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

export function NewTicketDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [titolo, setTitolo] = useState("");
  const [note, setNote] = useState("");
  const [cliente, setCliente] = useState<ClienteOption | null>(null);
  const [creatingCliente, setCreatingCliente] = useState(false);
  const [newCliente, setNewCliente] = useState<NewClienteDraft>(EMPTY_NEW_CLIENTE);

  function resetForm() {
    setTitolo("");
    setNote("");
    setCliente(null);
    setCreatingCliente(false);
    setNewCliente(EMPTY_NEW_CLIENTE);
  }

  function handleSubmit() {
    if (!titolo.trim()) {
      toast.error("Inserisci un titolo per il ticket.");
      return;
    }
    if (!creatingCliente && !cliente) {
      toast.error("Seleziona o crea un cliente.");
      return;
    }
    if (creatingCliente && !newCliente.nome.trim()) {
      toast.error("Inserisci il nome del nuovo cliente.");
      return;
    }

    startTransition(async () => {
      const result = creatingCliente
        ? await createTicket({ titolo, note, cliente: { mode: "new", data: newCliente } })
        : await createTicket({ titolo, note, cliente: { mode: "existing", id: cliente!.id } });

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
            Inserisci i dettagli della richiesta e collega il cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-titolo">Titolo</Label>
            <Input
              id="ticket-titolo"
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Es. Perdita in bagno"
            />
          </div>

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
              <div className="flex flex-col gap-3 rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newCliente.tipo}
                      onValueChange={(v) =>
                        setNewCliente((c) => ({ ...c, tipo: v as ClienteTipo }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="privato">Privato</SelectItem>
                        <SelectItem value="azienda">Azienda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Nome</Label>
                    <Input
                      value={newCliente.nome}
                      onChange={(e) => setNewCliente((c) => ({ ...c, nome: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Telefono</Label>
                    <Input
                      value={newCliente.telefono}
                      onChange={(e) =>
                        setNewCliente((c) => ({ ...c, telefono: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newCliente.email}
                      onChange={(e) => setNewCliente((c) => ({ ...c, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Indirizzo</Label>
                  <Input
                    value={newCliente.indirizzo}
                    onChange={(e) => setNewCliente((c) => ({ ...c, indirizzo: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Città</Label>
                    <Input
                      value={newCliente.citta}
                      onChange={(e) => setNewCliente((c) => ({ ...c, citta: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>CAP</Label>
                    <Input
                      value={newCliente.cap}
                      onChange={(e) => setNewCliente((c) => ({ ...c, cap: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>P.IVA / Codice Fiscale</Label>
                  <Input
                    value={newCliente.piva_cf}
                    onChange={(e) => setNewCliente((c) => ({ ...c, piva_cf: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Note cliente</Label>
                  <Textarea
                    value={newCliente.note}
                    onChange={(e) => setNewCliente((c) => ({ ...c, note: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <ClientCombobox value={cliente} onSelect={setCliente} />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-note">Note</Label>
            <Textarea
              id="ticket-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Dettagli aggiuntivi sulla richiesta..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? "Creazione..." : "Crea Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
