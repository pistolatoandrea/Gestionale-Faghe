-- Storage: bucket privato per le foto degli interventi
insert into storage.buckets (id, name, public)
values ('intervento-foto', 'intervento-foto', false)
on conflict (id) do nothing;

create policy "Utenti autenticati gestiscono le foto interventi"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'intervento-foto')
  with check (bucket_id = 'intervento-foto');

-- Tabella di metadati per le foto caricate per intervento
create table public.intervento_foto (
  id uuid primary key default gen_random_uuid(),
  intervento_id uuid not null references public.interventi (id) on delete cascade,
  storage_path text not null,
  nome_file text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index intervento_foto_intervento_id_idx on public.intervento_foto (intervento_id);

alter table public.intervento_foto enable row level security;

create policy "Utenti autenticati gestiscono le foto degli interventi"
  on public.intervento_foto for all
  to authenticated
  using (true)
  with check (true);
