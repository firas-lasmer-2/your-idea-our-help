ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS acquisition_source TEXT,
ADD COLUMN IF NOT EXISTS persona TEXT,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'new',
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_key TEXT NOT NULL DEFAULT 'free',
  billing_status TEXT NOT NULL DEFAULT 'manual',
  ai_daily_limit INTEGER NOT NULL DEFAULT 20,
  pdf_monthly_limit INTEGER NOT NULL DEFAULT 3,
  website_limit INTEGER NOT NULL DEFAULT 1,
  custom_domain_enabled BOOLEAN NOT NULL DEFAULT false,
  priority_support_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlements"
ON public.entitlements
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entitlements"
ON public.entitlements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entitlements"
ON public.entitlements
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all entitlements"
ON public.entitlements
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage entitlements"
ON public.entitlements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.usage_counters (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_requests_count INTEGER NOT NULL DEFAULT 0,
  pdf_downloads_count INTEGER NOT NULL DEFAULT 0,
  websites_published_count INTEGER NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON public.usage_counters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
ON public.usage_counters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
ON public.usage_counters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
ON public.usage_counters
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage usage"
ON public.usage_counters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.product_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_path TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_events_event_name ON public.product_events(event_name);
CREATE INDEX IF NOT EXISTS idx_product_events_user_id ON public.product_events(user_id);
CREATE INDEX IF NOT EXISTS idx_product_events_created_at ON public.product_events(created_at DESC);

ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
ON public.product_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own events or anonymous events"
ON public.product_events
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Admins can view all events"
ON public.product_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.feedback_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  message TEXT,
  page_path TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_entries_created_at ON public.feedback_entries(created_at DESC);

ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
ON public.feedback_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can submit own feedback"
ON public.feedback_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.feedback_entries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage feedback"
ON public.feedback_entries
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, onboarding_status, last_active_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    'signed_up',
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    onboarding_status = COALESCE(public.profiles.onboarding_status, 'signed_up'),
    last_active_at = now();

  INSERT INTO public.entitlements (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.usage_counters (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_from_product_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.profiles
  SET
    last_active_at = now(),
    acquisition_source = COALESCE(public.profiles.acquisition_source, NEW.source),
    onboarding_status = CASE
      WHEN NEW.event_name = 'website_published' THEN 'activated'
      WHEN NEW.event_name = 'resume_completed' AND public.profiles.onboarding_status <> 'activated' THEN 'resume_completed'
      WHEN NEW.event_name = 'resume_started' AND public.profiles.onboarding_status IN ('new', 'signed_up') THEN 'resume_started'
      WHEN NEW.event_name = 'signup_completed' AND public.profiles.onboarding_status = 'new' THEN 'signed_up'
      ELSE public.profiles.onboarding_status
    END
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS product_event_profile_sync ON public.product_events;
CREATE TRIGGER product_event_profile_sync
AFTER INSERT ON public.product_events
FOR EACH ROW EXECUTE FUNCTION public.update_profile_from_product_event();

CREATE OR REPLACE FUNCTION public.get_admin_growth_stats(days_back INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  since_date TIMESTAMPTZ := now() - make_interval(days => GREATEST(days_back, 1));
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT json_build_object(
    'window_days', days_back,
    'funnel', json_build_object(
      'signup_completed', COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.product_events WHERE event_name = 'signup_completed' AND created_at >= since_date), 0),
      'resume_started', COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.product_events WHERE event_name = 'resume_started' AND created_at >= since_date), 0),
      'resume_completed', COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.product_events WHERE event_name = 'resume_completed' AND created_at >= since_date), 0),
      'website_published', COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.product_events WHERE event_name = 'website_published' AND created_at >= since_date), 0),
      'ats_scored', COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.product_events WHERE event_name = 'ats_scored' AND created_at >= since_date), 0),
      'upgrade_clicked', COALESCE((SELECT COUNT(DISTINCT user_id) FROM public.product_events WHERE event_name = 'upgrade_clicked' AND created_at >= since_date), 0)
    ),
    'plan_distribution', COALESCE((
      SELECT json_agg(row_to_json(plan_rows))
      FROM (
        SELECT plan_key, COUNT(*)::INTEGER AS users
        FROM public.entitlements
        GROUP BY plan_key
        ORDER BY COUNT(*) DESC, plan_key
      ) AS plan_rows
    ), '[]'::json),
    'onboarding_distribution', COALESCE((
      SELECT json_agg(row_to_json(status_rows))
      FROM (
        SELECT onboarding_status, COUNT(*)::INTEGER AS users
        FROM public.profiles
        GROUP BY onboarding_status
        ORDER BY COUNT(*) DESC, onboarding_status
      ) AS status_rows
    ), '[]'::json),
    'recent_feedback', COALESCE((
      SELECT json_agg(row_to_json(feedback_rows))
      FROM (
        SELECT id, user_id, category, score, message, page_path, status, created_at
        FROM public.feedback_entries
        ORDER BY created_at DESC
        LIMIT 8
      ) AS feedback_rows
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;
