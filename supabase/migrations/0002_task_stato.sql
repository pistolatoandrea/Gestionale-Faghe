-- Aggiorna gli stati delle task da (da_fare, in_corso, completata) a (aperto, in_pausa, chiuso).
-- Ricrea il tipo enum invece di rinominare i valori perché i significati non sono un mapping 1:1.

create type public.task_stato_new as enum ('aperto', 'in_pausa', 'chiuso');

alter table public.task
  alter column stato drop default;

alter table public.task
  alter column stato type public.task_stato_new
  using (
    case stato::text
      when 'da_fare' then 'aperto'
      when 'in_corso' then 'in_pausa'
      when 'completata' then 'chiuso'
      else 'aperto'
    end
  )::public.task_stato_new;

alter table public.task
  alter column stato set default 'aperto';

drop type public.task_stato;

alter type public.task_stato_new rename to task_stato;
