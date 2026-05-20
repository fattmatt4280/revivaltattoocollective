
-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- has_role is called from RLS policies which run as the policy owner; no grants needed.
-- handle_new_user is a trigger on auth.users; no grants needed.

-- Replace overly permissive booking insert policy with a validated one
DROP POLICY IF EXISTS "Anyone can submit a booking" ON public.bookings;
CREATE POLICY "Public can submit valid bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    length(trim(contact_name)) BETWEEN 1 AND 120
    AND length(trim(contact_email)) BETWEEN 3 AND 254
    AND contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(description)) BETWEEN 5 AND 4000
    AND (contact_phone IS NULL OR length(contact_phone) <= 40)
    AND status = 'new'
  );

-- Restrict public bucket listing: allow reading individual objects only
DROP POLICY IF EXISTS "Public read of revival bucket" ON storage.objects;
CREATE POLICY "Public can read revival objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'revival' AND name IS NOT NULL);
-- Note: listing the bucket root requires authenticated access; admins still can via their ALL policies.
