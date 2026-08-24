import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InterventiTable, type InterventoRow } from "@/components/interventi/interventi-table";
import { InterventiFiltersBar } from "@/components/interventi/interventi-filters-bar";
import { Button } from "@/components/ui/button";
import type { InterventoStato } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

interface InterventiSearchParams {
  q?: string;
  stato?: string;
  from?: string;
  to?: string;
  sort?: string;
  dir?: string;
  page?: string;
}

async function InterventiLista({ searchParams }: { searchParams: InterventiSearchParams }) {
  const supabase = await createClient();

  const q = (searchParams.q ?? "").trim();
  const stato = (searchParams.stato ?? "") as InterventoStato | "";
  const from = searchParams.from ?? "";
  const to = searchParams.to ?? "";
  const sort = (["nome", "data_ora", "stato"].includes(searchParams.sort ?? "")
    ? searchParams.sort
    : "data_ora") as "nome" | "data_ora" | "stato";
  const dir = searchParams.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  let query = supabase
    .from("interventi")
    .select("id, nome, luogo, data_ora, stato, ticket:ticket_id(id, titolo)", {
      count: "exact",
    });

  if (q) {
    query = query.or(`nome.ilike.%${q}%,luogo.ilike.%${q}%`);
  }
  if (stato) {
    query = query.eq("stato", stato);
  }
  if (from) {
    query = query.gte("data_ora", new Date(`${from}T00:00:00`).toISOString());
  }
  if (to) {
    query = query.lte("data_ora", new Date(`${to}T23:59:59`).toISOString());
  }

  query = query.order(sort, { ascending: dir === "asc" });

  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;
  query = query.range(rangeFrom, rangeTo);

  const { data: interventi, count, error } = await query.returns<InterventoRow[]>();

  if (error) {
    console.error("Errore nel caricamento degli interventi:", error.message);
  }

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
    return `/interventi?${params.toString()}`;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Errore nel caricamento degli interventi. Riprova più tardi.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <InterventiTable interventi={interventi ?? []} sortable showTicket />

      {count !== null && count > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {count} intervent{count === 1 ? "o" : "i"} trovat{count === 1 ? "o" : "i"}
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

export default async function InterventiPage({
  searchParams,
}: {
  searchParams: Promise<InterventiSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Interventi</h1>
        <p className="text-muted-foreground">
          Tutti gli interventi sul campo. Si creano dalla pagina di dettaglio di un ticket.
        </p>
      </div>

      <Suspense>
        <InterventiFiltersBar />
      </Suspense>

      <Suspense>
        <InterventiLista searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
