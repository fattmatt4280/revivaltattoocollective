
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
CREATE TYPE public.tattoo_style AS ENUM ('color_realism', 'surrealism', 'traditional', 'lettering', 'sign_painting', 'other');
CREATE TYPE public.booking_status AS ENUM ('new', 'reviewing', 'confirmed', 'declined', 'completed');

-- =========================================================
-- UPDATED_AT TRIGGER FN
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by owner"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- USER ROLES (separate table — never on profiles)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role checker — avoids RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- ARTISTS
-- =========================================================
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  bio TEXT,
  instagram_handles JSONB NOT NULL DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active artists"
  ON public.artists FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage artists"
  ON public.artists FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- GALLERY IMAGES
-- =========================================================
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  style tattoo_style NOT NULL DEFAULT 'other',
  caption TEXT,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_gallery_artist ON public.gallery_images(artist_id);
CREATE INDEX idx_gallery_style ON public.gallery_images(style);
CREATE INDEX idx_gallery_order ON public.gallery_images(display_order);

CREATE POLICY "Public can view visible images"
  ON public.gallery_images FOR SELECT USING (visible = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage gallery"
  ON public.gallery_images FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- BOOKINGS
-- =========================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  style tattoo_style,
  description TEXT NOT NULL,
  reference_image_url TEXT,
  preferred_date DATE,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status booking_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_created ON public.bookings(created_at DESC);

CREATE POLICY "Anyone can submit a booking"
  ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view bookings"
  ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings"
  ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings"
  ON public.bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- SITE SETTINGS (single-row, key/value)
-- =========================================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read settings"
  ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (key, value) VALUES
  ('meta', '{"title":"Revival Tattoo Collective — Editorial Tattoo Studio in Clearwater, FL","description":"Expert tattoo and sign painting in Clearwater, Florida. Color realism, surrealism, traditional, and lettering."}'::jsonb),
  ('contact', '{"address":"1356 Cleveland St, Clearwater, FL 33755","phone":"(727) 953-8534","hours":"Tue – Sat · 12 – 8 PM"}'::jsonb);

-- =========================================================
-- STORAGE BUCKET
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('revival', 'revival', true);

CREATE POLICY "Public read of revival bucket"
  ON storage.objects FOR SELECT USING (bucket_id = 'revival');
CREATE POLICY "Admins upload to revival"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'revival' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update revival"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'revival' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete from revival"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'revival' AND public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- SEED ARTISTS (order: Brady → Ashlyn → Matt)
-- =========================================================
INSERT INTO public.artists (slug, name, specialty, bio, instagram_handles, display_order, active) VALUES
  ('brady', 'Brady Martin', 'Lettering · Sign Painting · Owner',
    'Founder of Revival. Brady is a tattooist and sign painter — script, blackletter, and custom typography on skin. He treats every word as architecture: measured, weighted, and built to live a lifetime.',
    '[{"handle":"@revivalletters","url":"https://instagram.com/revivalletters"}]'::jsonb, 1, true),
  ('ashlyn', 'Ashlyn', 'American Traditional',
    'Bold lines, packed color, and the discipline of tradition. Ashlyn approaches every flash sheet with reverence for the form and an editor''s eye.',
    '[{"handle":"@inkbyashlyn","url":"https://instagram.com/inkbyashlyn"}]'::jsonb, 2, true),
  ('matt', 'Matt', 'Color Realism · Surrealism',
    'Saturated, dream-state portraits and surreal compositions. Matt builds pieces that read like still frames pulled from a half-remembered film.',
    '[{"handle":"@shyftd.ink","url":"https://instagram.com/shyftd.ink"}]'::jsonb, 3, true);
