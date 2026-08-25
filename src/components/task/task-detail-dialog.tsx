"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updateTask } from "@/app/(dashboard)/task/actions";
import { TaskStatusPopover } from "@/components/task/task-status-popover";
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
import { resolveTaskLinks, type TaskRowWithLink } from "@/lib/task-links";
import type { TaskStato } from "@/lib/supabase/types";

export function TaskDetailDialog({
  open,
  onOpenChange,
  taskId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  onSaved: () => void;
}) {
  const [pending, startSaving] = useTransition();
  const [loading, startFetching] = useTransition();
  const [task, setTask] = useState<TaskRowWithLink | null>(null);

  const [titolo, setTitolo] = useState("");
  const [scadenza, setScadenza] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [stato, setStato] = useState<TaskStato>("aperto");

  useEffect(() => {
    if (!open || !taskId) return;

    let cancelled = false;

    startFetching(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("task")
        .select("id, titolo, descrizione, stato, scadenza, created_at, entity_type, entity_id")
        .eq("id", taskId)
        .single();

      if (cancelled) return;
      if (error || !data) {
        toast.error("Errore nel caricamento della task.");
        return;
      }
      const [withLink] = await resolveTaskLinks(supabase, [data]);
      if (cancelled) return;
      setTask(withLink);
      setTitolo(withLink.titolo);
      setScadenza(withLink.scadenza ?? "");
      setDescrizione(data.descrizione ?? "");
      setStato(withLink.stato);
    });

    return () => {
      cancelled = true;
    };
  }, [open, taskId]);

  function handleSubmit() {
    if (!task) return;
    if (!titolo.trim()) {
      toast.error("Inserisci un titolo per la task.");
      return;
    }

    startSaving(async () => {
      const result = await updateTask(task.id, {
        titolo,
        descrizione,
        scadenza: scadenza || null,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Task aggiornata.");
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task?.titolo ?? "Task"}</DialogTitle>
          <DialogDescription>
            {task?.linkedHref && task.linkedLabel ? (
              <>
                Collegata a{" "}
                <Link href={task.linkedHref} className="text-primary hover:underline">
                  {task.linkedLabel}
                </Link>
              </>
            ) : (
              "Dettagli della task."
            )}
          </DialogDescription>
        </DialogHeader>

        {loading || !task ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label>Stato</Label>
              <TaskStatusPopover taskId={task.id} stato={stato} onChange={setStato} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-detail-titolo">Titolo</Label>
              <Input id="task-detail-titolo" value={titolo} onChange={(e) => setTitolo(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-detail-scadenza">Scadenza</Label>
              <Input
                id="task-detail-scadenza"
                type="date"
                value={scadenza}
                onChange={(e) => setScadenza(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-detail-descrizione">Descrizione</Label>
              <Textarea
                id="task-detail-descrizione"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={pending || loading || !task}>
            {pending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
