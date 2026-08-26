"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTicketChecklistItem } from "@/app/(dashboard)/ticket/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { TICKET_CHECKLIST } from "@/lib/ticket-checklist";

export function TicketChecklist({
  ticketId,
  initialChecklist,
}: {
  ticketId: string;
  initialChecklist: Record<string, boolean>;
}) {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [, startSaving] = useTransition();

  function handleToggle(slug: string, checked: boolean) {
    setChecklist((prev) => ({ ...prev, [slug]: checked }));

    startSaving(async () => {
      const result = await updateTicketChecklistItem(ticketId, slug, checked);

      if ("error" in result) {
        toast.error(result.error);
        setChecklist((prev) => ({ ...prev, [slug]: !checked }));
      }
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TICKET_CHECKLIST.map((item) => (
        <label key={item.slug} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={checklist[item.slug] ?? false}
            onCheckedChange={(checked) => handleToggle(item.slug, checked === true)}
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}
