## Switch from Shopify to Paddle

Paddle is one of Lovable's built-in payment providers, so no API keys or credentials are needed from you — a test environment is provisioned automatically and you can run fake-card checkouts immediately. Going live later just requires Paddle's verification step.

### Steps

1. **Eligibility check** — run `recommend_payment_provider` to confirm Paddle accepts this product type (signed art prints, stickers — physical goods sold by the studio). If Paddle rejects physical goods for this catalog, I'll flag it and we'll fall back to Stripe (also built-in, no keys needed).
2. **Enable Paddle** via `enable_paddle_payments`. You'll fill out a short form (email, business name). Test environment is live immediately after.
3. **Create products in Paddle** via `batch_create_product` — start with the two items already drafted earlier:
   - Signed Art Print 11x14 — $45
   - Large Format Print 18x24 — $85
   You can add more anytime.
4. **Rip out Shopify code**:
   - Delete `src/lib/shopify.ts`, `src/hooks/useCartSync.ts`, `src/stores/cartStore.ts`
   - Delete `src/routes/product.$handle.tsx` (Paddle uses hosted checkout, no per-product page needed unless you want one)
   - Remove the `useCartSync` call from `src/routes/__root.tsx`
5. **Rebuild merch with Paddle**:
   - `src/lib/products.ts` — server function that lists products from Paddle
   - `src/stores/cartStore.ts` — simple local zustand cart (no remote cart needed; Paddle takes the cart into a checkout session)
   - `src/components/site/CartDrawer.tsx` — updated to open Paddle Checkout (overlay or hosted page) with the line items
   - `src/components/site/ProductCard.tsx` — updated to use the new product shape
   - `src/routes/merch.tsx` — fetches from the new server function
6. **Verify** the checkout flow end-to-end with Paddle's test card.

### Notes

- Visual design stays exactly as-is (dark editorial merch grid you already have).
- No Square credentials needed now or later unless you change your mind.
- When you're ready to take real payments, Paddle walks you through verification — no code changes.
