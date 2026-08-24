import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TaskTable } from "@/components/task/task-table";
import { TaskFiltersBar } from "@/components/task/task-filters-bar";
import { Button } from "@/components/ui/button";
import { resolveTaskLinks, type TaskRow } from "@/lib/task-links";
import type { TaskStato } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

interface TuttiTaskSearchParams {
  q?: string;
  stato?: string;
  sort?: string;
  dir?: string;
  page?: string;
}

async function TaskListaCompleta({ searchParams }: { searchParams: TuttiTaskSearchParams }) {
  const supabase = await createClient();

  const q = (searchParams.q ?? "").trim();
  const stato = (searchParams.stato ?? "") as TaskStato | "";
  const sort = (["titolo", "stato", "scadenza", "created_at"].includes(searchParams.sort ?? "")
    ? searchParams.sort
    : "created_at") as "titolo" | "stato" | "scadenza" | "created_at";
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  let query = supabase
    .from("task")
    .select("id, titolo, stato, scadenza, created_at, entity_type, entity_id", {
      count: "exact",
    });

  if (q) {
    query = query.ilike("titolo", `%${q}%`);
  }
  if (stato) {
    query = query.eq("stato", stato);
  }

  query = query.order(sort, { ascending: dir === "asc", nullsFirst: false });

  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;
  query = query.range(rangeFrom, rangeTo);

  const { data: tasks, count, error } = await query.returns<TaskRow[]>();

  if (error) {
    console.error("Errore nel caricamento dei task:", error.message);
  }

  const tasksConLink = await resolveTaskLinks(supabase, tasks ?? []);

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (stato) params.set("stato", stato);
    params.set("sort", sort);
    params.set("dir", dir);
    params.set("page", String(targetPage));
    return `/task/tutti?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Errore nel caricamento dei task. Riprova più tardi.
        </div>
      ) : (
        <TaskTable tasks={tasksConLink} sortable showLink />
      )}

      {count !== null && count > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {count} task trovat{count === 1 ? "a" : "e"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              nativeButton={false}
              render={<Link href={pageHref(page - 1)} />}
            >
              Precedente
            </Button>
            <span>
              Pagina {page} di {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              nativeButton={false}
              render={<Link href={pageHref(page + 1)} />}
            >
              Successiva
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function TuttiTaskPage({
  searchParams,
}: {
  searchParams: Promise<TuttiTaskSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tutti i Task</h1>
        <p className="text-muted-foreground">
          Cerca, filtra e ordina tutte le task, ordinate per data di creazione decrescente.
        </p>
      </div>

      <Suspense>
        <TaskFiltersBar />
      </Suspense>

      <Suspense>
        <TaskListaCompleta searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
