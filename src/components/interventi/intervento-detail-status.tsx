"use client";

import { useState } from "react";
import { InterventoStatusPopover } from "@/components/interventi/intervento-status-popover";
import type { InterventoStato } from "@/lib/supabase/types";

export function InterventoDetailStatus({
  interventoId,
  initialStato,
}: {
  interventoId: string;
  initialStato: InterventoStato;
}) {
  const [stato, setStato] = useState(initialStato);
  return <InterventoStatusPopover interventoId={interventoId} stato={stato} onChange={setStato} />;
}
