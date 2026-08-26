-- Applica a livello di bucket i limiti già validati lato client, come difesa
-- in profondità ora che l'upload dei file avviene direttamente dal browser
-- verso Supabase Storage (bypassando il server Next.js).
update storage.buckets
set file_size_limit = 15728640, -- 15MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif']
where id = 'intervento-foto';
