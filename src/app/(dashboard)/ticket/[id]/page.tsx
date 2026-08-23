import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function TicketDettaglioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("ticket")
    .select("id, numero, titolo")
    .eq("id", id)
    .single();

  if (!ticket) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-16 text-center">
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        nativeButton={false}
        render={<Link href="/ticket" />}
      >
        <ArrowLeft className="size-4" />
        Torna ai ticket
      </Button>
      <h1 className="text-xl font-semibold">
        Ticket #{ticket.numero} — {ticket.titolo}
      </h1>
      <p className="text-muted-foreground">
        I dettagli di questo ticket verranno mostrati qui in una fase successiva.
      </p>
    </div>
  );
}
