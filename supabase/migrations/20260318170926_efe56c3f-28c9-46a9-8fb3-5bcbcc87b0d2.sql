ALTER TABLE public.websites ADD COLUMN slug TEXT UNIQUE;
CREATE INDEX idx_websites_slug ON public.websites(slug);