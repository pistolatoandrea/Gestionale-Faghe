import type { LucideIcon } from "lucide-react";
import { CalendarDays, ListTodo, Ticket, Users } from "lucide-react";

export interface ModuleDef {
  slug: string;
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

// Unica fonte di verità per i moduli disponibili: usata sia nella home
// (bottoni) sia nella navigazione. Aggiungere un modulo futuro significa
// aggiungere una riga qui + la relativa route in src/app/(dashboard).
export const MODULES: ModuleDef[] = [
  {
    slug: "ticket",
    href: "/ticket",
    label: "Ticket",
    description: "Richieste di lavoro ricevute da clienti",
    icon: Ticket,
  },
  {
    slug: "clienti",
    href: "/clienti",
    label: "Clienti",
    description: "Anagrafica clienti e storico ticket",
    icon: Users,
  },
  {
    slug: "calendario",
    href: "/calendario",
    label: "Calendario",
    description: "Interventi programmati",
    icon: CalendarDays,
  },
  {
    slug: "task",
    href: "/task",
    label: "Task",
    description: "Attività collegate a ticket, clienti e interventi",
    icon: ListTodo,
  },
];
