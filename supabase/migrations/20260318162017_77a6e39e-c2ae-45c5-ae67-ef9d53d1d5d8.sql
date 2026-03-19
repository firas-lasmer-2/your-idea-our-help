
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin RLS policies on existing tables
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all resumes" ON public.resumes
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all websites" ON public.websites
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact submissions" ON public.contact_submissions
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin stats view function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_resumes', (SELECT COUNT(*) FROM public.resumes),
    'total_websites', (SELECT COUNT(*) FROM public.websites),
    'published_websites', (SELECT COUNT(*) FROM public.websites WHERE is_published = true),
    'total_contacts', (SELECT COUNT(*) FROM public.contact_submissions),
    'recent_users', (SELECT json_agg(row_to_json(p)) FROM (SELECT id, full_name, avatar_url, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 10) p),
    'recent_resumes', (SELECT json_agg(row_to_json(r)) FROM (SELECT id, title, template, created_at, user_id, is_complete FROM public.resumes ORDER BY created_at DESC LIMIT 10) r),
    'recent_websites', (SELECT json_agg(row_to_json(w)) FROM (SELECT id, title, purpose, template, is_published, created_at, user_id FROM public.websites ORDER BY created_at DESC LIMIT 10) w)
  ) INTO result;
  
  RETURN result;
END;
$$;
