ALTER TABLE public.bookings
  ADD COLUMN deposit_tier text,
  ADD COLUMN deposit_amount_cents integer,
  ADD COLUMN stripe_session_id text UNIQUE,
  ADD COLUMN stripe_payment_intent_id text,
  ADD COLUMN deposit_paid_at timestamptz;

DROP POLICY IF EXISTS "Public can submit valid bookings" ON public.bookings;
