"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { deleteTask } from "@/app/(dashboard)/task/actions";
import { TaskDetailDialog } from "@/components/task/task-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TaskRowActions({
  taskId,
  onDeleted,
}: {
  taskId: string;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  function handleDelete() {
    if (!window.confirm("Eliminare questa task? L'operazione non è reversibile.")) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteTask(taskId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Task eliminata.");
      onDeleted();
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" />}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Azioni task</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Modifica</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Eliminazione..." : "Elimina"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskDetailDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        taskId={taskId}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
