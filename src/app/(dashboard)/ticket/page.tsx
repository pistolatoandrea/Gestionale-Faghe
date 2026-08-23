import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewTicketDialog } from "@/components/ticket/new-ticket-dialog";
import { TicketTable, type TicketRow } from "@/components/ticket/ticket-table";
import { Button } from "@/components/ui/button";

const RECENT_LIMIT = 10;

export default async function TicketPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from("ticket")
    .select("id, titolo, stato, created_at, clienti(nome)")
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT)
    .returns<TicketRow[]>();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ticket</h1>
          <p className="text-muted-foreground">Richieste di lavoro ricevute dai clienti.</p>
        </div>
        <NewTicketDialog />
      </div>

      <TicketTable tickets={tickets ?? []} />

      <div className="flex justify-center">
        <Button variant="outline" nativeButton={false} render={<Link href="/ticket/tutti" />}>
          Tutti i Ticket
        </Button>
      </div>
    </div>
  );
}
