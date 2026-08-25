-- Modulo Calendario: tabella eventi, gestita interamente dal nostro backend
-- (nessun embedding di calendari esterni). In futuro è prevista la sincronizzazione
-- con calendari esterni (es. Google Calendar): questa tabella è pensata per
-- restare la fonte di verità locale anche quando quell'integrazione arriverà.

create type public.evento_tipo as enum ('intervento', 'altro');

create table public.eventi (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_ora timestamptz not null,
  luogo text,
  tipo public.evento_tipo not null default 'altro',
  intervento_id uuid references public.interventi (id) on delete set null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_eventi_updated_at
  before update on public.eventi
  for each row execute function public.set_updated_at();

create index eventi_data_ora_idx on public.eventi (data_ora);
create index eventi_intervento_id_idx on public.eventi (intervento_id);

alter table public.eventi enable row level security;

create policy "Utenti autenticati gestiscono gli eventi"
  on public.eventi for all
  to authenticated
  using (true)
  with check (true);
