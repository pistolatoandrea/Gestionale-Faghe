"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListPlus } from "lucide-react";
import { toast } from "sonner";
import { createTask } from "@/app/(dashboard)/task/actions";
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
import type { TaskEntityType } from "@/lib/supabase/types";

export function NewTaskDialog({
  entityType,
  entityId,
  entityLabel,
}: {
  entityType: TaskEntityType;
  entityId: string;
  entityLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [scadenza, setScadenza] = useState("");

  function resetForm() {
    setTitolo("");
    setDescrizione("");
    setScadenza("");
  }

  function handleSubmit() {
    if (!titolo.trim()) {
      toast.error("Inserisci un titolo per la task.");
      return;
    }

    startTransition(async () => {
      const result = await createTask({
        titolo,
        descrizione,
        scadenza: scadenza || undefined,
        entityType,
        entityId,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Task creata.");
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
        <ListPlus className="size-4" />
        Crea Task
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova Task</DialogTitle>
          <DialogDescription>Collegata a: {entityLabel}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-titolo">Titolo</Label>
            <Input
              id="task-titolo"
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              placeholder="Es. Richiamare il cliente per conferma orario"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-scadenza">Scadenza</Label>
            <Input
              id="task-scadenza"
              type="date"
              value={scadenza}
              onChange={(e) => setScadenza(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-descrizione">Descrizione</Label>
            <Textarea
              id="task-descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? "Creazione..." : "Crea Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
