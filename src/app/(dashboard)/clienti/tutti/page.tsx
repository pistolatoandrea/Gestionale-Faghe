import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClientiTable, type ClienteRow } from "@/components/clienti/clienti-table";
import { ClientiFiltersBar } from "@/components/clienti/clienti-filters-bar";
import { Button } from "@/components/ui/button";
import type { ClienteTipo } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

interface TuttiClientiSearchParams {
  q?: string;
  tipo?: string;
  sort?: string;
  dir?: string;
  page?: string;
}

async function ClientiListaCompleta({ searchParams }: { searchParams: TuttiClientiSearchParams }) {
  const supabase = await createClient();

  const q = (searchParams.q ?? "").trim();
  const tipo = (searchParams.tipo ?? "") as ClienteTipo | "";
  const sort = (["nome", "tipo", "created_at"].includes(searchParams.sort ?? "")
    ? searchParams.sort
    : "nome") as "nome" | "tipo" | "created_at";
  const dir = searchParams.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);

  let query = supabase
    .from("clienti")
    .select("id, nome, tipo, telefono, email, citta, created_at", { count: "exact" });

  if (q) {
    query = query.or(`nome.ilike.%${q}%,telefono.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  query = query.order(sort, { ascending: dir === "asc" });

  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;
  query = query.range(rangeFrom, rangeTo);

  const { data: clienti, count } = await query.returns<ClienteRow[]>();

  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tipo) params.set("tipo", tipo);
    params.set("sort", sort);
    params.set("dir", dir);
    params.set("page", String(targetPage));
    return `/clienti/tutti?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <ClientiTable clienti={clienti ?? []} sortable />

      {count !== null && count > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {count} client{count === 1 ? "e" : "i"} trovat{count === 1 ? "o" : "i"}
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

export default async function TuttiClientiPage({
  searchParams,
}: {
  searchParams: Promise<TuttiClientiSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tutti i Clienti</h1>
        <p className="text-muted-foreground">Cerca, filtra e ordina l&apos;intera anagrafica clienti.</p>
      </div>

      <Suspense>
        <ClientiFiltersBar />
      </Suspense>

      <Suspense>
        <ClientiListaCompleta searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
