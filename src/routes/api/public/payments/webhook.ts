import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient, getWebhookSecret, type StripeEnv } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type Stripe from "stripe";

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const envParam = url.searchParams.get("env");
        const env: StripeEnv = envParam === "live" ? "live" : "sandbox";

        const signature = request.headers.get("stripe-signature");
        const body = await request.text();

        if (!signature) {
          return new Response("Missing signature", { status: 400 });
        }

        let event: Stripe.Event;
        try {
          const stripe = createStripeClient(env);
          event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            getWebhookSecret(env),
          );
        } catch (err) {
          console.error("Webhook signature verification failed:", err);
          return new Response("Invalid signature", { status: 401 });
        }

        try {
          if (event.type === "checkout.session.completed") {
            await handleCheckoutCompleted(event, env);
          }
        } catch (err) {
          console.error(`Failed to process ${event.type}:`, err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

async function handleCheckoutCompleted(event: Stripe.Event, env: StripeEnv) {
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return;

  const stripe = createStripeClient(env);

  // Branch: booking deposit vs merch order, based on session metadata.
  if (session.metadata?.kind === "booking_deposit") {
    await handleBookingDeposit(session);
    return;
  }

  // Retrieve full session with line items + shipping
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product", "shipping_cost.shipping_rate", "total_details.breakdown"],
  });

  const items =
    full.line_items?.data.map((li) => {
      const product = li.price?.product as Stripe.Product | undefined;
      return {
        name: product?.name ?? li.description ?? "Item",
        product_id: typeof product === "object" ? product.id : null,
        price_id: li.price?.id ?? null,
        lookup_key: li.price?.lookup_key ?? null,
        quantity: li.quantity ?? 1,
        unit_amount_cents: li.price?.unit_amount ?? 0,
        amount_subtotal_cents: li.amount_subtotal ?? 0,
        amount_total_cents: li.amount_total ?? 0,
      };
    }) ?? [];

  const shipping = full.collected_information?.shipping_details ?? null;

  const orderRow = {
    stripe_session_id: full.id,
    stripe_payment_intent_id:
      typeof full.payment_intent === "string" ? full.payment_intent : full.payment_intent?.id ?? null,
    customer_email: full.customer_details?.email ?? full.customer_email ?? "unknown@unknown",
    customer_name: full.customer_details?.name ?? shipping?.name ?? null,
    shipping_address: shipping
      ? {
          name: shipping.name,
          line1: shipping.address?.line1,
          line2: shipping.address?.line2,
          city: shipping.address?.city,
          state: shipping.address?.state,
          postal_code: shipping.address?.postal_code,
          country: shipping.address?.country,
        }
      : null,
    items,
    subtotal_cents: full.amount_subtotal ?? 0,
    tax_cents: full.total_details?.amount_tax ?? 0,
    shipping_cents: full.shipping_cost?.amount_total ?? 0,
    total_cents: full.amount_total ?? 0,
    currency: (full.currency ?? "usd").toLowerCase(),
    status: "paid" as const,
  };

  const { error } = await supabaseAdmin
    .from("orders")
    .upsert(orderRow, { onConflict: "stripe_session_id" });

  if (error) {
    console.error("Failed to insert order:", error);
    throw error;
  }

  console.log(`Order recorded: ${full.id} (${orderRow.customer_email}, ${items.length} items, $${(orderRow.total_cents / 100).toFixed(2)})`);
}

async function handleBookingDeposit(session: Stripe.Checkout.Session) {
  const m = session.metadata ?? {};
  const tier = m.deposit_tier === "full_day" ? "full_day" : "half_day";
  const depositAmountCents = tier === "full_day" ? 20000 : 10000;

  // Reconstruct description from chunked metadata.
  const chunkCount = parseInt(m.description_chunks ?? "0", 10);
  let description = "";
  for (let i = 0; i < chunkCount; i++) description += m[`description_${i}`] ?? "";
  if (!description) description = "(no description provided)";

  const allowedStyles = ["color_realism", "surrealism", "traditional", "lettering", "sign_painting", "other"] as const;
  type TattooStyle = typeof allowedStyles[number];
  const style: TattooStyle | null =
    m.style && (allowedStyles as readonly string[]).includes(m.style) ? (m.style as TattooStyle) : null;

  const row = {
    artist_id: m.artist_id || null,
    style,
    description,
    preferred_date: m.preferred_date || null,
    contact_name: m.contact_name || "Unknown",
    contact_email: m.contact_email || session.customer_details?.email || "unknown@unknown",
    contact_phone: m.contact_phone || null,
    reference_image_url: m.reference_image_url || null,
    status: "new" as const,
    deposit_tier: tier,
    deposit_amount_cents: depositAmountCents,
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    deposit_paid_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("bookings")
    .upsert(row, { onConflict: "stripe_session_id" });

  if (error) {
    console.error("Failed to insert booking:", error);
    throw error;
  }

  console.log(`Booking deposit recorded: ${session.id} (${row.contact_email}, ${tier}, $${(depositAmountCents / 100).toFixed(2)})`);
}