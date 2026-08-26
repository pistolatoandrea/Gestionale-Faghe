import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewTaskDialog } from "@/components/task/new-task-dialog";
import { TaskTable } from "@/components/task/task-table";
import { TicketTable, type TicketRow } from "@/components/ticket/ticket-table";
import { resolveTaskLinks, type TaskRow } from "@/lib/task-links";
import { CLIENTE_TIPO_LABELS } from "@/lib/cliente-draft";
import { formatDateIT } from "@/lib/format";

export default async function ClienteDettaglioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clienti")
    .select("id, nome, tipo, telefono, email, indirizzo, citta, cap, piva_cf, note, created_at")
    .eq("id", id)
    .single();

  if (!cliente) {
    notFound();
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("task")
    .select("id, titolo, stato, scadenza, created_at, entity_type, entity_id")
    .eq("entity_type", "cliente")
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .returns<TaskRow[]>();

  if (tasksError) {
    console.error("Errore nel caricamento delle task del cliente:", tasksError.message);
  }

  const tasksConLink = await resolveTaskLinks(supabase, tasks ?? []);

  const { data: ticketCollegati, error: ticketError } = await supabase
    .from("ticket")
    .select("id, titolo, stato, created_at, clienti(id, nome)")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false })
    .returns<TicketRow[]>();

  if (ticketError) {
    console.error("Errore nel caricamento dei ticket del cliente:", ticketError.message);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/clienti" />}>
          <ArrowLeft className="size-4" />
          Torna ai clienti
        </Button>
        <NewTaskDialog entityType="cliente" entityId={cliente.id} entityLabel={cliente.nome} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <h1 className="text-xl font-semibold">{cliente.nome}</h1>
          <Badge variant="secondary">{CLIENTE_TIPO_LABELS[cliente.tipo]}</Badge>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Telefono</dt>
              <dd>{cliente.telefono ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd>{cliente.email ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Indirizzo</dt>
              <dd>
                {[cliente.indirizzo, cliente.citta, cliente.cap].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">P.IVA / Codice Fiscale</dt>
              <dd>{cliente.piva_cf ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Cliente da</dt>
              <dd>{formatDateIT(cliente.created_at)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Note</dt>
              <dd className="whitespace-pre-wrap">{cliente.note ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ticket collegati</h2>
        {ticketError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Errore nel caricamento dei ticket.
          </div>
        ) : (
          <TicketTable tickets={ticketCollegati ?? []} showCliente={false} />
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
