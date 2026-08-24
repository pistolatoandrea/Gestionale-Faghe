import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TicketDetailStatus } from "@/components/ticket/ticket-detail-status";
import { NewTaskDialog } from "@/components/task/new-task-dialog";
import { TaskTable } from "@/components/task/task-table";
import { NewInterventoDialog } from "@/components/interventi/new-intervento-dialog";
import { InterventiTable, type InterventoRow } from "@/components/interventi/interventi-table";
import { resolveTaskLinks, type TaskRow } from "@/lib/task-links";
import { formatDateIT } from "@/lib/format";

const CANALE_LABELS = { telefono: "Telefono", email: "Email", altro: "Altro" };

export default async function TicketDettaglioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("ticket")
    .select(
      "id, numero, titolo, descrizione, stato, canale, priorita, created_at, clienti(id, nome)"
    )
    .eq("id", id)
    .single();

  if (!ticket) {
    notFound();
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("task")
    .select("id, titolo, stato, scadenza, created_at, entity_type, entity_id")
    .eq("entity_type", "ticket")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .returns<TaskRow[]>();

  if (tasksError) {
    console.error("Errore nel caricamento delle task del ticket:", tasksError.message);
  }

  const tasksConLink = await resolveTaskLinks(supabase, tasks ?? []);

  const { data: interventi, error: interventiError } = await supabase
    .from("interventi")
    .select("id, nome, luogo, data_ora, stato, ticket:ticket_id(id, titolo)")
    .eq("ticket_id", id)
    .order("data_ora", { ascending: true })
    .returns<InterventoRow[]>();

  if (interventiError) {
    console.error("Errore nel caricamento degli interventi del ticket:", interventiError.message);
  }

  const ticketLabel = `Ticket #${ticket.numero} — ${ticket.titolo}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/ticket" />}>
          <ArrowLeft className="size-4" />
          Torna ai ticket
        </Button>
        <div className="flex items-center gap-2">
          <NewInterventoDialog ticketId={ticket.id} ticketLabel={ticketLabel} />
          <NewTaskDialog entityType="ticket" entityId={ticket.id} entityLabel={ticketLabel} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Ticket #{ticket.numero}</p>
            <h1 className="text-xl font-semibold">{ticket.titolo}</h1>
          </div>
          <TicketDetailStatus ticketId={ticket.id} initialStato={ticket.stato} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Cliente</dt>
              <dd>
                {ticket.clienti ? (
                  <Link href={`/clienti/${ticket.clienti.id}`} className="text-primary hover:underline">
                    {ticket.clienti.nome}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Canale</dt>
              <dd>{CANALE_LABELS[ticket.canale]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Priorità</dt>
              <dd>{ticket.priorita ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Data creazione</dt>
              <dd>{formatDateIT(ticket.created_at)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Note</dt>
              <dd className="whitespace-pre-wrap">{ticket.descrizione ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Interventi</h2>
        {interventiError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Errore nel caricamento degli interventi.
          </div>
        ) : (
          <InterventiTable interventi={interventi ?? []} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Task</h2>
        {tasksError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Errore nel caricamento delle task.
          </div>
        ) : (
          <TaskTable tasks={tasksConLink} />
        )}
      </div>
    </div>
  );
}
