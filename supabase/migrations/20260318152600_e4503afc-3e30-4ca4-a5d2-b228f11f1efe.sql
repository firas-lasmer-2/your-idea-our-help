
CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Mon site web',
  purpose TEXT NOT NULL DEFAULT 'portfolio',
  template TEXT NOT NULL DEFAULT 'dev-portfolio',
  data JSONB NOT NULL DEFAULT '{}',
  global_settings JSONB NOT NULL DEFAULT '{"primaryColor": "#0d9488", "fontPair": "inter", "layout": "standard"}',
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own websites"
  ON public.websites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own websites"
  ON public.websites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites"
  ON public.websites FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites"
  ON public.websites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
