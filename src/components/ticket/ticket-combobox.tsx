"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface TicketOption {
  id: string;
  numero: number;
  titolo: string;
}

export function TicketCombobox({
  value,
  onSelect,
}: {
  value: TicketOption | null;
  onSelect: (ticket: TicketOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TicketOption[]>([]);
  const [loading, startSearch] = useTransition();

  useEffect(() => {
    if (!open) return;

    const supabase = createClient();
    const handle = setTimeout(() => {
      startSearch(async () => {
        let req = supabase
          .from("ticket")
          .select("id, numero, titolo")
          .order("created_at", { ascending: false })
          .limit(8);
        const term = query.trim();
        if (term) {
          req = req.ilike("titolo", `%${term}%`);
        }
        const { data } = await req;
        setResults(data ?? []);
      });
    }, 250);

    return () => clearTimeout(handle);
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" className="w-full justify-between font-normal" />
        }
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? `#${value.numero} — ${value.titolo}` : "Cerca ticket per titolo..."}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Titolo del ticket..." value={query} onValueChange={setQuery} />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Ricerca...
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty>Nessun ticket trovato.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((t) => (
                  <CommandItem
                    key={t.id}
                    value={t.id}
                    data-checked={value?.id === t.id}
                    onSelect={() => {
                      onSelect(t);
                      setOpen(false);
                    }}
                  >
                    <span>
                      #{t.numero} — {t.titolo}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
