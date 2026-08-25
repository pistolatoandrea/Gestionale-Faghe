import { CalendarView } from "@/components/calendario/calendar-view";

export default function CalendarioPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendario</h1>
        <p className="text-muted-foreground">
          Clicca su un giorno per creare un evento, su un evento per vederne i dettagli.
          Trascina un evento per spostarlo.
        </p>
      </div>

      <CalendarView />
    </div>
  );
}
