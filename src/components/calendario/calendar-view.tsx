"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import type {
  EventClickArg,
  EventDropArg,
  EventInput,
  EventSourceFuncArg,
} from "@fullcalendar/core";
import itLocale from "@fullcalendar/core/locales/it";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import { toast } from "sonner";
import { moveEvento } from "@/app/(dashboard)/calendario/actions";
import { moveIntervento } from "@/app/(dashboard)/interventi/actions";
import { moveTaskScadenza } from "@/app/(dashboard)/task/actions";
import { EventoInfoDialog } from "@/components/calendario/evento-info-dialog";
import { NewEventDialog } from "@/components/calendario/new-event-dialog";
import { InterventoInfoDialog } from "@/components/interventi/intervento-info-dialog";
import { TaskInfoDialog } from "@/components/task/task-info-dialog";
import { Button } from "@/components/ui/button";
import { CALENDAR_SOURCE_STYLE, type CalendarSource } from "@/lib/calendario-colors";
import { toDateOnlyValue, toDatetimeLocalValue } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";

interface CalendarExtendedProps {
  source: CalendarSource;
}

export function CalendarView() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialDataOra, setCreateInitialDataOra] = useState("");

  const [detailSource, setDetailSource] = useState<CalendarSource | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  function refetch() {
    calendarRef.current?.getApi().refetchEvents();
  }

  function handleSaved() {
    router.refresh();
    refetch();
  }

  function closeDetail() {
    setDetailSource(null);
    setDetailId(null);
  }

  function openCreateAt(date: Date) {
    setCreateInitialDataOra(toDatetimeLocalValue(date));
    setCreateOpen(true);
  }

  async function fetchEvents(
    info: EventSourceFuncArg,
    successCallback: (events: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ) {
    const supabase = createClient();
    const startDate = toDateOnlyValue(info.start);
    const endDate = toDateOnlyValue(info.end);

    const [interventiRes, taskRes, eventiRes] = await Promise.all([
      supabase
        .from("interventi")
        .select("id, nome, data_ora")
        .gte("data_ora", info.startStr)
        .lt("data_ora", info.endStr),
      supabase
        .from("task")
        .select("id, titolo, scadenza")
        .not("scadenza", "is", null)
        .gte("scadenza", startDate)
        .lt("scadenza", endDate),
      supabase
        .from("eventi")
        .select("id, nome, data_ora")
        .gte("data_ora", info.startStr)
        .lt("data_ora", info.endStr),
    ]);

    const firstError = interventiRes.error ?? taskRes.error ?? eventiRes.error;
    if (firstError) {
      failureCallback(new Error(firstError.message));
      return;
    }

    const events: EventInput[] = [
      ...(interventiRes.data ?? []).map((i) => ({
        id: i.id,
        title: i.nome,
        start: i.data_ora,
        color: CALENDAR_SOURCE_STYLE.intervento.color,
        extendedProps: { source: "intervento" } satisfies CalendarExtendedProps,
      })),
      ...(taskRes.data ?? []).map((t) => ({
        id: t.id,
        title: t.titolo,
        start: t.scadenza as string,
        allDay: true,
        color: CALENDAR_SOURCE_STYLE.task.color,
        textColor: "#1a1a1a",
        extendedProps: { source: "task" } satisfies CalendarExtendedProps,
      })),
      ...(eventiRes.data ?? []).map((e) => ({
        id: e.id,
        title: e.nome,
        start: e.data_ora,
        color: CALENDAR_SOURCE_STYLE.evento.color,
        extendedProps: { source: "evento" } satisfies CalendarExtendedProps,
      })),
    ];

    successCallback(events);
  }

  function handleDateClick(info: DateClickArg) {
    openCreateAt(info.date);
  }

  function handleEventClick(info: EventClickArg) {
    const props = info.event.extendedProps as CalendarExtendedProps;
    setDetailSource(props.source);
    setDetailId(info.event.id);
  }

  function handleEventDrop(info: EventDropArg) {
    const start = info.event.start;
    if (!start) return;

    const props = info.event.extendedProps as CalendarExtendedProps;

    const movePromise =
      props.source === "intervento"
        ? moveIntervento(info.event.id, start.toISOString())
        : props.source === "task"
          ? moveTaskScadenza(info.event.id, toDateOnlyValue(start))
          : moveEvento(info.event.id, start.toISOString());

    movePromise.then((result) => {
      if ("error" in result) {
        toast.error(result.error);
        info.revert();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {Object.values(CALENDAR_SOURCE_STYLE).map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
        <Button type="button" onClick={() => openCreateAt(new Date())}>
          <Plus className="size-4" />
          Nuovo Evento
        </Button>
      </div>

      <div className="fc-midnight rounded-lg border bg-card p-2 sm:p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="listWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          locale={itLocale}
          height="auto"
          editable
          selectable={false}
          events={fetchEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
        />
      </div>

      <NewEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialDataOra={createInitialDataOra}
        onCreated={handleSaved}
      />

      <InterventoInfoDialog
        open={detailSource === "intervento"}
        onOpenChange={(next) => !next && closeDetail()}
        interventoId={detailSource === "intervento" ? detailId : null}
        onChanged={handleSaved}
      />

      <TaskInfoDialog
        open={detailSource === "task"}
        onOpenChange={(next) => !next && closeDetail()}
        taskId={detailSource === "task" ? detailId : null}
        onChanged={handleSaved}
      />

      <EventoInfoDialog
        open={detailSource === "evento"}
        onOpenChange={(next) => !next && closeDetail()}
        eventoId={detailSource === "evento" ? detailId : null}
        onChanged={handleSaved}
      />
    </div>
  );
}
