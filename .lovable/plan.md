## Goal

Add a public booking form that collects a non-refundable deposit via the same Stripe checkout used for merch. Booking is only saved after the deposit clears.

## Deposit tiers (new Stripe products)

Create via `payments--batch_create_product` (tax code `txcd_99999999` — services):

- `booking_deposit_half_day` — "Tattoo Deposit — Half Day or Less" — **$100** — `deposit_half_day`
- `booking_deposit_full_day` — "Tattoo Deposit — Half to Full Day" — **$200** — `deposit_full_day`

Quantity locked to 1.

## Frontend

**New: `src/components/site/BookingForm.tsx`** — rendered on the home page (`#book` anchor) above `<Contact />`.

Fields:
- Artist (select from active `artists`)
- Style (enum, optional)
- **Sitting length** — radio:
  - Half day or less (≤4 hrs) — **$100 deposit**
  - Half to full day (4–8 hrs) — **$200 deposit**
- Description (textarea)
- Preferred date (optional)
- Reference image (optional upload → `revival` bucket)
- Name, email, phone

Submit button: "Continue to deposit — $100/$200". Validates client-side, stores form draft in `sessionStorage`, then navigates to `/book/checkout`.

**New: `src/routes/book.checkout.tsx`** — reads draft from `sessionStorage`, renders order summary + `<StripeEmbeddedCheckout>` (existing component, extended to accept a single price + booking metadata). Test-mode banner included.

**New: `src/routes/book.return.tsx`** — confirmation page after Stripe return; shows "Booking received — we'll be in touch" and clears the draft.

**Update: `src/components/site/Contact.tsx`** — `#book` anchor already exists; no change needed beyond ensuring `BookingForm` has `id="book"`.

## Backend

**Extend `src/lib/payments.functions.ts`**

Add `createBookingDepositCheckout` server fn:
- Input: `{ depositTier: "half_day" | "full_day", bookingDraft: {...validated fields...}, returnUrl, environment }`
- Maps tier → `deposit_half_day` / `deposit_full_day` lookup key
- Creates Stripe Checkout Session (`mode: payment`, `ui_mode: embedded_page`)
- Passes `automatic_tax: { enabled: true }` (matches merch setup)
- Stashes the full booking draft on `session.metadata` (JSON-stringified, ≤500 chars per Stripe key — split if needed) **and** on `payment_intent_data.metadata` for redundancy
- Sets `payment_intent_data.description` to `"Tattoo deposit — <tier label>"`
- Collects `customer_email` from form
- Returns `clientSecret`

**Extend webhook `src/routes/api/public/payments/webhook.ts`**

In `handleCheckoutCompleted`, branch on the line item's lookup key:
- `print_*` (existing) → insert into `orders` as today
- `deposit_*` → parse booking draft from metadata, insert into `bookings` table via `supabaseAdmin` with `status: 'new'`, plus new columns:

## Schema migration

Add to `bookings`:
- `deposit_tier` text (`'half_day' | 'full_day'`, nullable so existing rows still validate)
- `deposit_amount_cents` integer
- `stripe_session_id` text unique (idempotency key for webhook upsert)
- `stripe_payment_intent_id` text
- `deposit_paid_at` timestamptz

Tighten RLS: **drop** the existing `"Public can submit valid bookings"` INSERT policy — bookings now only enter via the webhook (service role, bypasses RLS). Admin SELECT/UPDATE/DELETE policies remain.

## Admin updates

`src/routes/admin.bookings.tsx`: show deposit tier, deposit amount, and a "Refund deposit" link that opens the Stripe payment in the dashboard (manual refund, per the chosen policy). No auto-refund logic.

## Files touched

```
created  src/components/site/BookingForm.tsx
created  src/routes/book.checkout.tsx
created  src/routes/book.return.tsx
created  supabase/migrations/<ts>_bookings_deposits.sql
edited   src/routes/index.tsx              (mount <BookingForm />)
edited   src/lib/payments.functions.ts     (+createBookingDepositCheckout)
edited   src/components/StripeEmbeddedCheckout.tsx  (accept generic checkout fetcher OR a 2nd variant)
edited   src/routes/api/public/payments/webhook.ts  (branch on lookup key → orders|bookings)
edited   src/routes/admin.bookings.tsx     (deposit columns + refund link)
```

## Notes / non-goals

- **Manual refunds only** — declining a booking in admin does not refund automatically; refunds happen in the Stripe dashboard.
- Deposits are charged at submission; an unpaid abandonment never creates a `bookings` row.
- No subscription/recurring logic — one-time payment only.
- Stripe Tax is left on for consistency with merch; services tax code `txcd_99999999` keeps it conservative for FL.
