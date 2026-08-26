"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { deleteTicket } from "@/app/(dashboard)/ticket/actions";
import { EditTicketDialog } from "@/components/ticket/edit-ticket-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TicketRowActions({
  ticketId,
  onDeleted,
}: {
  ticketId: string;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        "Eliminare questo ticket? Verranno eliminati anche gli interventi e le task collegate. L'operazione non è reversibile."
      )
    ) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteTicket(ticketId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Ticket eliminato.");
      onDeleted();
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="ghost" size="icon-sm" />}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Azioni ticket</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Modifica</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Eliminazione..." : "Elimina"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTicketDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        ticketId={ticketId}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
