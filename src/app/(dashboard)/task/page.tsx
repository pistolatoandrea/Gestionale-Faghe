import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TaskTable } from "@/components/task/task-table";
import { Button } from "@/components/ui/button";
import { resolveTaskLinks, type TaskRow } from "@/lib/task-links";

const RECENT_LIMIT = 10;

export default async function TaskPage() {
  const supabase = await createClient();

  const { data: tasks, error } = await supabase
    .from("task")
    .select("id, titolo, stato, scadenza, created_at, entity_type, entity_id")
    .neq("stato", "chiuso")
    .order("created_at", { ascending: false })
    .limit(RECENT_LIMIT)
    .returns<TaskRow[]>();

  if (error) {
    console.error("Errore nel caricamento delle task:", error.message);
  }

  const tasksConLink = await resolveTaskLinks(supabase, tasks ?? []);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Task</h1>
        <p className="text-muted-foreground">
          Attività aperte o in pausa, collegate a ticket e clienti. Le task si creano dalla pagina
          di dettaglio di un ticket o di un cliente.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Errore nel caricamento delle task. Riprova più tardi.
        </div>
      ) : (
        <TaskTable tasks={tasksConLink} showLink />
      )}

      <div className="flex justify-center">
        <Button variant="outline" nativeButton={false} render={<Link href="/task/tutti" />}>
          Tutti i Task
        </Button>
      </div>
    </div>
  );
}
