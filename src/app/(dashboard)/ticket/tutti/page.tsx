import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TicketTable, type TicketRow } from "@/components/ticket/ticket-table";
import { TicketFiltersBar } from "@/components/ticket/ticket-filters-bar";
import { Button } from "@/components/ui/button";
import type { TicketStato } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

interface TuttiTicketSearchParams {
  q?: string;
  stato?: string;
  from?: string;
  to?: string;
  sort?: string;
  dir?: string;
  page?: string;
}

async function TicketListaCompleta({ searchParams }: { searchParams: TuttiTicketSearchParams }) {
  const supabase = await createClient();

  const q = (searchParams.q ?? "").trim();
  const stato = (searchParams.stato ?? "") as TicketStato | "";
  const from = searchParams.from ?? "";
  const to = searchParams.to ?? "";
  const sort = (["titolo", "stato", "created_at"].includes(searchParams.sort ?? "")
    ? searchParams.sort
    : "created_at") as "titolo" | "stato" | "created_at";
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  let query = supabase
    .from("ticket")
    .select("id, titolo, stato, created_at, clienti!inner(nome)", { count: "exact" });

  if (q) {
    query = query.filter("clienti.nome", "ilike", `%${q}%`);
  }
  if (stato) {
    query = query.eq("stato", stato);
  }
  if (from) {
    query = query.gte("created_at", new Date(`${from}T00:00:00`).toISOString());
  }
  if (to) {
    query = query.lte("created_at", new Date(`${to}T23:59:59`).toISOString());
  }

  query = query.order(sort, { ascending: dir === "asc" });

  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;
  query = query.range(rangeFrom, rangeTo);

  const { data: tickets, count } = await query.returns<TicketRow[]>();

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (stato) params.set("stato", stato);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("sort", sort);
    params.set("dir", dir);
    params.set("page", String(targetPage));
    return `/ticket/tutti?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <TicketTable tickets={tickets ?? []} sortable />

      {count !== null && count > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {count} ticket{count === 1 ? "" : "s"} trovat{count === 1 ? "o" : "i"}
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

export default async function TuttiTicketPage({
  searchParams,
}: {
  searchParams: Promise<TuttiTicketSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tutti i Ticket</h1>
        <p className="text-muted-foreground">Cerca, filtra e ordina tutti i ticket registrati.</p>
      </div>

      <Suspense>
        <TicketFiltersBar />
      </Suspense>

      <Suspense>
        <TicketListaCompleta searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
