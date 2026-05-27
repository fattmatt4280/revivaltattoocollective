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