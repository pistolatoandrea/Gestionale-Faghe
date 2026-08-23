-- Schema iniziale gestionale idraulico
-- Tabelle: profiles, clienti, ticket, interventi, task
-- Modello single-tenant: qualunque utente autenticato (profilo) può leggere/scrivere tutto.
-- Pronto per RBAC futuro: la colonna profiles.ruolo è già presente per restringere le policy in seguito.

-- ---------------------------------------------------------------------------
-- Funzione di utilità: aggiorna updated_at ad ogni update
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: estende auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  ruolo text not null default 'utente',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Utenti autenticati leggono tutti i profili"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Un utente aggiorna solo il proprio profilo"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Crea automaticamente un profilo alla registrazione di un nuovo utente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- clienti
-- ---------------------------------------------------------------------------
create type public.cliente_tipo as enum ('privato', 'azienda');

create table public.clienti (
  id uuid primary key default gen_random_uuid(),
  tipo public.cliente_tipo not null default 'privato',
  nome text not null,
  telefono text,
  email text,
  indirizzo text,
  citta text,
  cap text,
  piva_cf text,
  note text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_clienti_updated_at
  before update on public.clienti
  for each row execute function public.set_updated_at();

alter table public.clienti enable row level security;

create policy "Utenti autenticati gestiscono i clienti"
  on public.clienti for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- ticket
-- ---------------------------------------------------------------------------
create type public.ticket_stato as enum (
  'nuovo',
  'programmato_intervento',
  'chiuso',
  'perso'
);

create type public.ticket_canale as enum ('telefono', 'email', 'altro');

create sequence public.ticket_numero_seq;

create table public.ticket (
  id uuid primary key default gen_random_uuid(),
  numero integer not null default nextval('public.ticket_numero_seq'),
  titolo text not null,
  descrizione text,
  cliente_id uuid not null references public.clienti (id) on delete restrict,
  stato public.ticket_stato not null default 'nuovo',
  priorita text,
  canale public.ticket_canale not null default 'telefono',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter sequence public.ticket_numero_seq owned by public.ticket.numero;

create trigger set_ticket_updated_at
  before update on public.ticket
  for each row execute function public.set_updated_at();

create index ticket_cliente_id_idx on public.ticket (cliente_id);
create index ticket_stato_idx on public.ticket (stato);

alter table public.ticket enable row level security;

create policy "Utenti autenticati gestiscono i ticket"
  on public.ticket for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- interventi
-- ---------------------------------------------------------------------------
create type public.intervento_stato as enum ('programmato', 'completato', 'annullato');

create table public.interventi (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.ticket (id) on delete cascade,
  data_inizio timestamptz not null,
  data_fine timestamptz not null,
  indirizzo text,
  stato public.intervento_stato not null default 'programmato',
  assegnato_a uuid references public.profiles (id),
  note text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interventi_date_valide check (data_fine > data_inizio)
);

create trigger set_interventi_updated_at
  before update on public.interventi
  for each row execute function public.set_updated_at();

create index interventi_ticket_id_idx on public.interventi (ticket_id);
create index interventi_data_inizio_idx on public.interventi (data_inizio);

alter table public.interventi enable row level security;

create policy "Utenti autenticati gestiscono gli interventi"
  on public.interventi for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- task
-- ---------------------------------------------------------------------------
create type public.task_stato as enum ('da_fare', 'in_corso', 'completata');
create type public.task_entity_type as enum ('ticket', 'cliente', 'intervento');

create table public.task (
  id uuid primary key default gen_random_uuid(),
  titolo text not null,
  descrizione text,
  stato public.task_stato not null default 'da_fare',
  scadenza date,
  assegnato_a uuid references public.profiles (id),
  entity_type public.task_entity_type,
  entity_id uuid,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_entity_coerente check (
    (entity_type is null and entity_id is null) or
    (entity_type is not null and entity_id is not null)
  )
);

create trigger set_task_updated_at
  before update on public.task
  for each row execute function public.set_updated_at();

create index task_entity_idx on public.task (entity_type, entity_id);
create index task_stato_idx on public.task (stato);

alter table public.task enable row level security;

create policy "Utenti autenticati gestiscono i task"
  on public.task for all
  to authenticated
  using (true)
  with check (true);
