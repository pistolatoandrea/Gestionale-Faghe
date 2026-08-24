-- Ridefinisce la tabella interventi secondo le specifiche del modulo Interventi:
-- nome auto-generato, luogo, data/ora singola (non più intervallo inizio-fine),
-- descrizione, nuovo enum stato (da_fare / chiuso / da_tornare, default da_fare).

alter table public.interventi drop constraint interventi_date_valide;

create type public.intervento_stato_new as enum ('da_fare', 'chiuso', 'da_tornare');

alter table public.interventi alter column stato drop default;

alter table public.interventi
  alter column stato type public.intervento_stato_new
  using (
    case stato::text
      when 'programmato' then 'da_fare'
      when 'completato' then 'chiuso'
      when 'annullato' then 'da_tornare'
      else 'da_fare'
    end
  )::public.intervento_stato_new;

alter table public.interventi alter column stato set default 'da_fare';

drop type public.intervento_stato;
alter type public.intervento_stato_new rename to intervento_stato;

alter table public.interventi rename column indirizzo to luogo;
alter table public.interventi rename column note to descrizione;
alter table public.interventi rename column data_inizio to data_ora;
alter table public.interventi drop column data_fine;

alter index interventi_data_inizio_idx rename to interventi_data_ora_idx;

-- Nome auto-generato lato applicazione, es. "Perdita bagno - intervento #1"
alter table public.interventi add column nome text not null;
