"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TaskRowActions } from "@/components/task/task-row-actions";
import { TaskStatusPopover } from "@/components/task/task-status-popover";
import { formatDateIT } from "@/lib/format";
import type { TaskRowWithLink } from "@/lib/task-links";
import type { TaskStato } from "@/lib/supabase/types";

type SortField = "titolo" | "stato" | "scadenza" | "created_at";

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

export function TaskTable({
  tasks,
  sortable = false,
  showLink = false,
}: {
  tasks: TaskRowWithLink[];
  sortable?: boolean;
  showLink?: boolean;
}) {
  const [prevTasks, setPrevTasks] = useState(tasks);
  const [items, setItems] = useState(tasks);

  if (tasks !== prevTasks) {
    setPrevTasks(tasks);
    setItems(tasks);
  }

  function handleStatoChange(taskId: string, nextStato: TaskStato) {
    setItems((prev) => prev.map((t) => (t.id === taskId ? { ...t, stato: nextStato } : t)));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Nessuna task trovata.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {sortable ? <SortableHead field="titolo" label="Titolo" /> : <TableHead>Titolo</TableHead>}
            {sortable ? <SortableHead field="stato" label="Stato" /> : <TableHead>Stato</TableHead>}
            {sortable ? (
              <SortableHead field="scadenza" label="Scadenza" />
            ) : (
              <TableHead>Scadenza</TableHead>
            )}
            {sortable ? (
              <SortableHead field="created_at" label="Data" />
            ) : (
              <TableHead>Data</TableHead>
            )}
            {showLink && <TableHead>Collegata a</TableHead>}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.titolo}</TableCell>
              <TableCell>
                <TaskStatusPopover
                  taskId={t.id}
                  stato={t.stato}
                  onChange={(next) => handleStatoChange(t.id, next)}
                />
              </TableCell>
              <TableCell>{t.scadenza ? formatDateIT(t.scadenza) : "—"}</TableCell>
              <TableCell>{formatDateIT(t.created_at)}</TableCell>
              {showLink && (
                <TableCell>
                  {t.linkedHref && t.linkedLabel ? (
                    <Link href={t.linkedHref} className="text-primary hover:underline">
                      {t.linkedLabel}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
              )}
              <TableCell>
                <TaskRowActions
                  taskId={t.id}
                  onDeleted={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
