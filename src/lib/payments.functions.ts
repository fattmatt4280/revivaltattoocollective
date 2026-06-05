import { createServerFn } from "@tanstack/react-start";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

interface CartLine {
  priceId: string;
  quantity: number;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: {
    items: CartLine[];
    customerEmail?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Cart is empty");
    }
    if (data.items.length > 20) throw new Error("Too many items");
    for (const item of data.items) {
      if (!/^[a-zA-Z0-9_-]+$/.test(item.priceId)) throw new Error("Invalid priceId");
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) {
        throw new Error("Invalid quantity");
      }
    }
    if (data.environment !== "sandbox" && data.environment !== "live") {
      throw new Error("Invalid environment");
    }
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);

      // Resolve human-readable price IDs (lookup_keys) into Stripe price IDs.
      const lookupKeys = data.items.map((i) => i.priceId);
      const prices = await stripe.prices.list({ lookup_keys: lookupKeys, limit: 100 });
      const priceByLookup = new Map(prices.data.map((p) => [p.lookup_key, p]));

      const lineItems = data.items.map((item) => {
        const price = priceByLookup.get(item.priceId);
        if (!price) throw new Error(`Price not found: ${item.priceId}`);
        return { price: price.id, quantity: item.quantity };
      });

      const productNames = (
        await Promise.all(
          data.items.map(async (item) => {
            const price = priceByLookup.get(item.priceId)!;
            const productId = typeof price.product === "string" ? price.product : price.product.id;
            const product = await stripe.products.retrieve(productId);
            return `${product.name} ×${item.quantity}`;
          }),
        )
      ).join(", ");

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        ...(data.customerEmail && { customer_email: data.customerEmail }),
        automatic_tax: { enabled: true },
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: 800, currency: "usd" },
              display_name: "Standard shipping (USPS, 3–7 business days)",
              delivery_estimate: {
                minimum: { unit: "business_day", value: 3 },
                maximum: { unit: "business_day", value: 7 },
              },
              tax_behavior: "exclusive",
              tax_code: "txcd_92010001",
            },
          },
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: 2000, currency: "usd" },
              display_name: "Express shipping (USPS Priority, 1–3 business days)",
              delivery_estimate: {
                minimum: { unit: "business_day", value: 1 },
                maximum: { unit: "business_day", value: 3 },
              },
              tax_behavior: "exclusive",
              tax_code: "txcd_92010001",
            },
          },
        ],
        payment_intent_data: {
          description: `Revival merch: ${productNames}`,
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

// ---------------------------------------------------------------------------
// Booking deposits
// ---------------------------------------------------------------------------

type DepositTier = "half_day" | "full_day";

interface BookingDraft {
  artist_id: string | null;
  style: string | null;
  description: string;
  preferred_date: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  reference_image_url: string | null;
}

const DEPOSIT_PRICE: Record<DepositTier, { priceLookup: string; label: string; cents: number }> = {
  half_day: { priceLookup: "deposit_half_day", label: "Half day or less", cents: 10000 },
  full_day: { priceLookup: "deposit_full_day", label: "Half to full day", cents: 20000 },
};

// Stripe metadata: max 50 keys, max 500 chars per value. Chunk description so we
// can reconstruct it in the webhook without a side table.
function chunkString(s: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out;
}

function draftToMetadata(draft: BookingDraft, tier: DepositTier): Record<string, string> {
  const meta: Record<string, string> = {
    kind: "booking_deposit",
    deposit_tier: tier,
    artist_id: draft.artist_id ?? "",
    style: draft.style ?? "",
    preferred_date: draft.preferred_date ?? "",
    contact_name: draft.contact_name.slice(0, 480),
    contact_email: draft.contact_email.slice(0, 480),
    contact_phone: draft.contact_phone?.slice(0, 480) ?? "",
    reference_image_url: draft.reference_image_url?.slice(0, 480) ?? "",
  };
  const chunks = chunkString(draft.description, 450);
  meta.description_chunks = String(chunks.length);
  chunks.forEach((c, i) => { meta[`description_${i}`] = c; });
  return meta;
}

export const createBookingDepositCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: {
    depositTier: DepositTier;
    bookingDraft: BookingDraft;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (data.depositTier !== "half_day" && data.depositTier !== "full_day") {
      throw new Error("Invalid deposit tier");
    }
    const d = data.bookingDraft;
    if (!d || typeof d !== "object") throw new Error("Missing booking details");
    if (!d.contact_name?.trim() || d.contact_name.length > 120) throw new Error("Invalid name");
    if (!d.contact_email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact_email) || d.contact_email.length > 254) {
      throw new Error("Invalid email");
    }
    if (!d.description?.trim() || d.description.length < 5 || d.description.length > 4000) {
      throw new Error("Description must be 5–4000 characters");
    }
    if (d.contact_phone && d.contact_phone.length > 40) throw new Error("Invalid phone");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const tierCfg = DEPOSIT_PRICE[data.depositTier];

      const prices = await stripe.prices.list({ lookup_keys: [tierCfg.priceLookup], limit: 1 });
      if (!prices.data.length) throw new Error(`Deposit price not found: ${tierCfg.priceLookup}`);
      const price = prices.data[0];

      const metadata = draftToMetadata(data.bookingDraft, data.depositTier);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer_email: data.bookingDraft.contact_email,
        automatic_tax: { enabled: true },
        metadata,
        payment_intent_data: {
          description: `Tattoo booking deposit — ${tierCfg.label}`,
          metadata,
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });