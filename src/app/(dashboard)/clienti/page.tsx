import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewClienteDialog } from "@/components/clienti/new-cliente-dialog";
import { ClientiTable } from "@/components/clienti/clienti-table";
import { Button } from "@/components/ui/button";
import { buildClientiAttivi, type ActiveTicketJoinRow } from "@/lib/clienti-attivi";

const RECENT_LIMIT = 10;

export default async function ClientiPage() {
  const supabase = await createClient();

  const { data: activeTicketRows } = await supabase
    .from("ticket")
    .select("cliente_id, created_at, clienti(id, nome, tipo, telefono, email, citta)")
    .in("stato", ["nuovo", "programmato_intervento"])
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<ActiveTicketJoinRow[]>();

  const clientiAttivi = buildClientiAttivi(activeTicketRows ?? [], RECENT_LIMIT);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Clienti</h1>
          <p className="text-muted-foreground">
            Clienti con almeno un ticket attivo (non chiuso né perso).
          </p>
        </div>
        <NewClienteDialog />
      </div>

      <ClientiTable clienti={clientiAttivi} />

      <div className="flex justify-center">
        <Button variant="outline" nativeButton={false} render={<Link href="/clienti/tutti" />}>
          Tutti i Clienti
        </Button>
      </div>
    </div>
  );
}
