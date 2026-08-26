alter table public.ticket add column questionario jsonb not null default '{}'::jsonb;
