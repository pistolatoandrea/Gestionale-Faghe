alter table public.ticket add column checklist jsonb not null default '{}'::jsonb;
