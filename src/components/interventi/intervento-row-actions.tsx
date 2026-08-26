"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { deleteIntervento } from "@/app/(dashboard)/interventi/actions";
import { InterventoDetailDialog } from "@/components/interventi/intervento-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function InterventoRowActions({
  interventoId,
  onDeleted,
}: {
  interventoId: string;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        "Eliminare questo intervento? Verranno eliminate anche le task collegate. L'operazione non è reversibile."
      )
    ) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteIntervento(interventoId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Intervento eliminato.");
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
          <span className="sr-only">Azioni intervento</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Modifica</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Eliminazione..." : "Elimina"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InterventoDetailDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        interventoId={interventoId}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
