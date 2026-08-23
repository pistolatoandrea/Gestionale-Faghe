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

export interface ClienteOption {
  id: string;
  nome: string;
  telefono: string | null;
}

export function ClientCombobox({
  value,
  onSelect,
}: {
  value: ClienteOption | null;
  onSelect: (cliente: ClienteOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClienteOption[]>([]);
  const [loading, startSearch] = useTransition();

  useEffect(() => {
    if (!open) return;

    const supabase = createClient();
    const handle = setTimeout(() => {
      startSearch(async () => {
        let req = supabase.from("clienti").select("id, nome, telefono").order("nome").limit(8);
        const term = query.trim();
        if (term) {
          req = req.or(`nome.ilike.%${term}%,telefono.ilike.%${term}%`);
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
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? value.nome : "Cerca cliente per nome o telefono..."}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Nome o telefono..." value={query} onValueChange={setQuery} />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Ricerca...
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty>Nessun cliente trovato.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.id}
                    data-checked={value?.id === c.id}
                    onSelect={() => {
                      onSelect(c);
                      setOpen(false);
                    }}
                  >
                    <span>{c.nome}</span>
                    {c.telefono && (
                      <span className="ml-2 text-xs text-muted-foreground">{c.telefono}</span>
                    )}
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
