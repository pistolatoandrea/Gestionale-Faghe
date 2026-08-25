-- Il calendario ora legge interventi e task direttamente dalle loro tabelle
-- (nessuna copia duplicata). La tabella eventi resta solo per gli eventi
-- generici "Altro" creati a mano dal calendario, quindi tipo/intervento_id
-- non servono più.

alter table public.eventi drop column tipo;
alter table public.eventi drop column intervento_id;

drop type public.evento_tipo;
