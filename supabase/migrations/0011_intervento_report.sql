-- Campi del form di report, salvati sull'intervento stesso (1:1, sovrascrivibili
-- ad ogni rigenerazione), più il riferimento al PDF generato.
alter table public.interventi
  add column report_oggetto text,
  add column report_verifiche text,
  add column report_operatore text,
  add column report_path text,
  add column report_generato_at timestamptz;

-- Storage: bucket privato per i PDF di report generati
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('intervento-report', 'intervento-report', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

create policy "Utenti autenticati gestiscono i report interventi"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'intervento-report')
  with check (bucket_id = 'intervento-report');
