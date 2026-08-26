"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { deleteCliente } from "@/app/(dashboard)/clienti/actions";
import { EditClienteDialog } from "@/components/clienti/edit-cliente-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ClienteRowActions({
  clienteId,
  onDeleted,
}: {
  clienteId: string;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  function handleDelete() {
    if (!window.confirm("Eliminare questo cliente? L'operazione non è reversibile.")) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteCliente(clienteId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Cliente eliminato.");
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
          <span className="sr-only">Azioni cliente</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Modifica</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Eliminazione..." : "Elimina"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditClienteDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        clienteId={clienteId}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
