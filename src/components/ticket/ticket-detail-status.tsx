"use client";

import { useState } from "react";
import { TicketStatusPopover } from "@/components/ticket/ticket-status-popover";
import type { TicketStato } from "@/lib/supabase/types";

export function TicketDetailStatus({
  ticketId,
  initialStato,
}: {
  ticketId: string;
  initialStato: TicketStato;
}) {
  const [stato, setStato] = useState(initialStato);
  return <TicketStatusPopover ticketId={ticketId} stato={stato} onChange={setStato} />;
}
