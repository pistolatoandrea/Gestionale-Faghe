"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TicketStatusPopover } from "@/components/ticket/ticket-status-popover";
import { formatDateIT } from "@/lib/format";
import type { TicketStato } from "@/lib/supabase/types";

export interface TicketRow {
  id: string;
  titolo: string;
  stato: TicketStato;
  created_at: string;
  clienti: { nome: string } | null;
}

type SortField = "titolo" | "stato" | "created_at";

function SortableHead({ field, label }: { field: SortField; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortField | null) ?? "created_at";
  const currentDir = searchParams.get("dir") === "asc" ? "asc" : "desc";
  const isActive = currentSort === field;

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir = isActive && currentDir === "desc" ? "asc" : "desc";
    params.set("sort", field);
    params.set("dir", nextDir);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const Icon = !isActive ? ArrowUpDown : currentDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 h-auto gap-1 px-2 py-1 font-medium"
        onClick={handleClick}
      >
        {label}
        <Icon className="size-3.5 text-muted-foreground" />
      </Button>
    </TableHead>
  );
}

export function TicketTable({
  tickets,
  sortable = false,
}: {
  tickets: TicketRow[];
  sortable?: boolean;
}) {
  const router = useRouter();
  const [prevTickets, setPrevTickets] = useState(tickets);
  const [items, setItems] = useState(tickets);

  if (tickets !== prevTickets) {
    setPrevTickets(tickets);
    setItems(tickets);
  }

  function handleStatoChange(ticketId: string, nextStato: TicketStato) {
    setItems((prev) => prev.map((t) => (t.id === ticketId ? { ...t, stato: nextStato } : t)));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nessun ticket trovato.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {sortable ? <SortableHead field="titolo" label="Titolo" /> : <TableHead>Titolo</TableHead>}
            <TableHead>Cliente</TableHead>
            {sortable ? <SortableHead field="stato" label="Stato" /> : <TableHead>Stato</TableHead>}
            {sortable ? (
              <SortableHead field="created_at" label="Data" />
            ) : (
              <TableHead>Data</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow
              key={t.id}
              className="cursor-pointer"
              onClick={() => router.push(`/ticket/${t.id}`)}
            >
              <TableCell className="font-medium">{t.titolo}</TableCell>
              <TableCell>{t.clienti?.nome ?? "—"}</TableCell>
              <TableCell>
                <TicketStatusPopover
                  ticketId={t.id}
                  stato={t.stato}
                  onChange={(next) => handleStatoChange(t.id, next)}
                />
              </TableCell>
              <TableCell>{formatDateIT(t.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
