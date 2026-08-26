"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InterventoRowActions } from "@/components/interventi/intervento-row-actions";
import { InterventoStatusPopover } from "@/components/interventi/intervento-status-popover";
import { formatDateTimeIT } from "@/lib/format";
import type { InterventoStato } from "@/lib/supabase/types";

export interface InterventoRow {
  id: string;
  nome: string;
  luogo: string | null;
  data_ora: string;
  stato: InterventoStato;
  ticket: { id: string; titolo: string } | null;
}

type SortField = "nome" | "data_ora" | "stato";

function SortableHead({ field, label }: { field: SortField; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortField | null) ?? "data_ora";
  const currentDir = searchParams.get("dir") === "desc" ? "desc" : "asc";
  const isActive = currentSort === field;

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";
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

export function InterventiTable({
  interventi,
  sortable = false,
  showTicket = false,
}: {
  interventi: InterventoRow[];
  sortable?: boolean;
  showTicket?: boolean;
}) {
  const router = useRouter();
  const [prevInterventi, setPrevInterventi] = useState(interventi);
  const [items, setItems] = useState(interventi);

  if (interventi !== prevInterventi) {
    setPrevInterventi(interventi);
    setItems(interventi);
  }

  function handleStatoChange(interventoId: string, nextStato: InterventoStato) {
    setItems((prev) =>
      prev.map((i) => (i.id === interventoId ? { ...i, stato: nextStato } : i))
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nessun intervento trovato.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {sortable ? <SortableHead field="nome" label="Nome" /> : <TableHead>Nome</TableHead>}
            <TableHead>Luogo</TableHead>
            {sortable ? (
              <SortableHead field="data_ora" label="Giorno e ora" />
            ) : (
              <TableHead>Giorno e ora</TableHead>
            )}
            {sortable ? <SortableHead field="stato" label="Stato" /> : <TableHead>Stato</TableHead>}
            {showTicket && <TableHead>Ticket</TableHead>}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((i) => (
            <TableRow
              key={i.id}
              className="cursor-pointer"
              onClick={(e) => {
                if (!e.currentTarget.contains(e.target as Node)) return;
                router.push(`/interventi/${i.id}`);
              }}
            >
              <TableCell className="font-medium">{i.nome}</TableCell>
              <TableCell>{i.luogo ?? "—"}</TableCell>
              <TableCell>{formatDateTimeIT(i.data_ora)}</TableCell>
              <TableCell>
                <InterventoStatusPopover
                  interventoId={i.id}
                  stato={i.stato}
                  onChange={(next) => handleStatoChange(i.id, next)}
                />
              </TableCell>
              {showTicket && (
                <TableCell>
                  {i.ticket ? (
                    <Link
                      href={`/ticket/${i.ticket.id}`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {i.ticket.titolo}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
              )}
              <TableCell>
                <InterventoRowActions
                  interventoId={i.id}
                  onDeleted={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
