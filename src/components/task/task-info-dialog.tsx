"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteTask } from "@/app/(dashboard)/task/actions";
import { TaskDetailDialog } from "@/components/task/task-detail-dialog";
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
import { formatDateIT } from "@/lib/format";
import { resolveTaskLinks, type TaskRowWithLink } from "@/lib/task-links";
import { taskStatoBadgeClassName, taskStatoLabel } from "@/lib/task-status";
import { createClient } from "@/lib/supabase/client";
import type { TaskEntityType } from "@/lib/supabase/types";

const ENTITY_TYPE_LABELS: Record<TaskEntityType, string> = {
  ticket: "Ticket",
  cliente: "Cliente",
  intervento: "Intervento",
};

export function TaskInfoDialog({
  open,
  onOpenChange,
  taskId,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  onChanged: () => void;
}) {
  const [loading, startFetching] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [task, setTask] = useState<TaskRowWithLink | null>(null);
  const [descrizione, setDescrizione] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

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
      setDescrizione(data.descrizione);
    });

    return () => {
      cancelled = true;
    };
  }, [open, taskId]);

  function handleModifica() {
    onOpenChange(false);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!task) return;
    if (!window.confirm("Eliminare questa task? L'operazione non è reversibile.")) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteTask(task.id);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Task eliminata.");
      onOpenChange(false);
      onChanged();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{task?.titolo ?? "Task"}</DialogTitle>
            <DialogDescription>Dettagli della task.</DialogDescription>
          </DialogHeader>

          {loading || !task ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Caricamento...</p>
          ) : (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Stato</dt>
                <dd>
                  <Badge className={taskStatoBadgeClassName(task.stato)}>
                    {taskStatoLabel(task.stato)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Scadenza</dt>
                <dd>{task.scadenza ? formatDateIT(task.scadenza) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tipo di oggetto associato</dt>
                <dd>{task.entity_type ? ENTITY_TYPE_LABELS[task.entity_type] : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Collegata a</dt>
                <dd>
                  {task.linkedHref && task.linkedLabel ? (
                    <Link href={task.linkedHref} className="text-primary hover:underline">
                      {task.linkedLabel}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Descrizione</dt>
                <dd className="whitespace-pre-wrap">{descrizione ?? "—"}</dd>
              </div>
            </dl>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading || !task}
            >
              {deleting ? "Eliminazione..." : "Elimina"}
            </Button>
            <Button type="button" onClick={handleModifica} disabled={loading || !task}>
              Modifica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskDetailDialog open={editOpen} onOpenChange={setEditOpen} taskId={taskId} onSaved={onChanged} />
    </>
  );
}
