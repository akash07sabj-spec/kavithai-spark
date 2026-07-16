
-- Repoint author FKs to profiles so PostgREST can embed profile via the same hint name
ALTER TABLE public.kavithais DROP CONSTRAINT IF EXISTS kavithais_author_id_fkey;
ALTER TABLE public.kavithais
  ADD CONSTRAINT kavithais_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Allow public read of avatar images (bucket also set public via tool)
DROP POLICY IF EXISTS "Avatars are viewable by authenticated users" ON storage.objects;
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
