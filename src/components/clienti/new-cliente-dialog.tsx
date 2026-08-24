"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createCliente } from "@/app/(dashboard)/clienti/actions";
import { ClienteFormFields } from "@/components/clienti/cliente-form-fields";
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
import { EMPTY_CLIENTE_DRAFT, type ClienteDraft } from "@/lib/cliente-draft";

export function NewClienteDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ClienteDraft>(EMPTY_CLIENTE_DRAFT);

  function handleSubmit() {
    if (!draft.nome.trim()) {
      toast.error("Inserisci il nome del cliente.");
      return;
    }

    startTransition(async () => {
      const result = await createCliente(draft);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Cliente creato.");
      setOpen(false);
      setDraft(EMPTY_CLIENTE_DRAFT);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDraft(EMPTY_CLIENTE_DRAFT);
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Nuovo Cliente
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuovo Cliente</DialogTitle>
          <DialogDescription>Inserisci i dati anagrafici del cliente.</DialogDescription>
        </DialogHeader>

        <ClienteFormFields value={draft} onChange={setDraft} />

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? "Creazione..." : "Crea Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
