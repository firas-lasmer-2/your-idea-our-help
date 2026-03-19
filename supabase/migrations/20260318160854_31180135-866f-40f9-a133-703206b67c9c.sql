
ALTER TABLE public.websites 
ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS published_data jsonb;

CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Website owners can view their submissions
CREATE POLICY "Website owners can view submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);

-- Anyone can submit contact forms (public insert)
CREATE POLICY "Anyone can submit contact forms"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Website owners can delete submissions
CREATE POLICY "Website owners can delete submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (
  website_id IN (SELECT id FROM public.websites WHERE user_id = auth.uid())
);

-- Public read policy for published websites
CREATE POLICY "Anyone can view published websites"
ON public.websites
FOR SELECT
TO anon
USING (is_published = true);

-- Storage bucket for website assets
INSERT INTO storage.buckets (id, name, public) VALUES ('website-assets', 'website-assets', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload website assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'website-assets');

CREATE POLICY "Anyone can view website assets"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'website-assets');

CREATE POLICY "Users can update own website assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'website-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own website assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'website-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
