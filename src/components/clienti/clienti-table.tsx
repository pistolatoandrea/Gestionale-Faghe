"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateIT } from "@/lib/format";
import { CLIENTE_TIPO_LABELS } from "@/lib/cliente-draft";
import type { ClienteTipo } from "@/lib/supabase/types";

export interface ClienteRow {
  id: string;
  nome: string;
  tipo: ClienteTipo;
  telefono: string | null;
  email: string | null;
  citta: string | null;
  created_at?: string;
  ticketAttivi?: number;
}

type SortField = "nome" | "tipo" | "created_at";

function SortableHead({ field, label }: { field: SortField; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortField | null) ?? "nome";
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

export function ClientiTable({
  clienti,
  sortable = false,
}: {
  clienti: ClienteRow[];
  sortable?: boolean;
}) {
  const router = useRouter();
  const showTicketAttivi = !sortable && clienti.some((c) => c.ticketAttivi !== undefined);
  const showData = sortable;

  if (clienti.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nessun cliente trovato.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {sortable ? <SortableHead field="nome" label="Nome" /> : <TableHead>Nome</TableHead>}
            {sortable ? <SortableHead field="tipo" label="Tipo" /> : <TableHead>Tipo</TableHead>}
            <TableHead>Telefono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Città</TableHead>
            {showTicketAttivi && <TableHead>Ticket attivi</TableHead>}
            {showData && <SortableHead field="created_at" label="Cliente da" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {clienti.map((c) => (
            <TableRow
              key={c.id}
              className="cursor-pointer"
              onClick={() => router.push(`/clienti/${c.id}`)}
            >
              <TableCell className="font-medium">{c.nome}</TableCell>
              <TableCell>{CLIENTE_TIPO_LABELS[c.tipo]}</TableCell>
              <TableCell>{c.telefono ?? "—"}</TableCell>
              <TableCell>{c.email ?? "—"}</TableCell>
              <TableCell>{c.citta ?? "—"}</TableCell>
              {showTicketAttivi && (
                <TableCell>
                  <Badge>{c.ticketAttivi}</Badge>
                </TableCell>
              )}
              {showData && <TableCell>{c.created_at ? formatDateIT(c.created_at) : "—"}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
