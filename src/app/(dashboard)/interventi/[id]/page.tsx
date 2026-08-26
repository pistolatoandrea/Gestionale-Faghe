import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InterventoDetailStatus } from "@/components/interventi/intervento-detail-status";
import { formatDateTimeIT } from "@/lib/format";
import type { InterventoStato } from "@/lib/supabase/types";

interface InterventoDetailPageData {
  id: string;
  nome: string;
  luogo: string | null;
  data_ora: string;
  stato: InterventoStato;
  descrizione: string | null;
  ticket: { id: string; numero: number; titolo: string } | null;
}

export default async function InterventoDettaglioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: intervento } = await supabase
    .from("interventi")
    .select("id, nome, luogo, data_ora, stato, descrizione, ticket:ticket_id(id, numero, titolo)")
    .eq("id", id)
    .single()
    .returns<InterventoDetailPageData>();

  if (!intervento) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/interventi" />}>
        <ArrowLeft className="size-4" />
        Torna agli interventi
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <h1 className="text-xl font-semibold">{intervento.nome}</h1>
          <InterventoDetailStatus interventoId={intervento.id} initialStato={intervento.stato} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Ticket</dt>
              <dd>
                {intervento.ticket ? (
                  <Link
                    href={`/ticket/${intervento.ticket.id}`}
                    className="text-primary hover:underline"
                  >
                    #{intervento.ticket.numero} — {intervento.ticket.titolo}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Giorno e ora</dt>
              <dd>{formatDateTimeIT(intervento.data_ora)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Luogo</dt>
              <dd>{intervento.luogo ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Descrizione</dt>
              <dd className="whitespace-pre-wrap">{intervento.descrizione ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
