"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateInterventoStato } from "@/app/(dashboard)/interventi/actions";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  INTERVENTO_STATO_OPTIONS,
  interventoStatoBadgeClassName,
  interventoStatoLabel,
} from "@/lib/intervento-status";
import type { InterventoStato } from "@/lib/supabase/types";

export function InterventoStatusPopover({
  interventoId,
  stato,
  onChange,
}: {
  interventoId: string;
  stato: InterventoStato;
  onChange: (next: InterventoStato) => void;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleChange(value: string) {
    const nextStato = value as InterventoStato;
    setOpen(false);
    if (nextStato === stato) return;

    const previousStato = stato;
    onChange(nextStato);

    startTransition(async () => {
      const result = await updateInterventoStato(interventoId, nextStato);
      if ("error" in result) {
        toast.error(result.error);
        onChange(previousStato);
      }
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="cursor-pointer rounded-full border-0 bg-transparent p-0 focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={(e) => e.stopPropagation()}
      >
        <Badge className={interventoStatoBadgeClassName(stato)}>
          {interventoStatoLabel(stato)}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start" onClick={(e) => e.stopPropagation()}>
        <RadioGroup value={stato} onValueChange={handleChange}>
          {INTERVENTO_STATO_OPTIONS.map((o) => (
            <div
              key={o.value}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
            >
              <RadioGroupItem value={o.value} id={`intervento-stato-${interventoId}-${o.value}`} />
              <Label
                htmlFor={`intervento-stato-${interventoId}-${o.value}`}
                className="flex-1 cursor-pointer font-normal"
              >
                {o.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
}
