import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";
import { Nav } from "@/components/site/Nav";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useCartStore } from "@/stores/cartStore";
import { getProduct, formatPrice } from "@/lib/products";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Revival Tattoo Collective" },
      { name: "description", content: "Securely complete your Revival Tattoo Collective order — signed prints and limited drops shipped from Largo, FL." },
      { property: "og:title", content: "Checkout — Revival Tattoo Collective" },
      { property: "og:description", content: "Complete your Revival Tattoo Collective order." },
      { property: "og:url", content: "https://revivaltattoocollective.com/checkout" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const { user } = useAuth();

  const lineItems = useMemo(
    () =>
      items
        .map((i) => ({ item: i, product: getProduct(i.productId) }))
        .filter(
          (x): x is { item: typeof items[number]; product: NonNullable<ReturnType<typeof getProduct>> } =>
            !!x.product,
        ),
    [items],
  );

  const stripeItems = useMemo(
    () => lineItems.map(({ item, product }) => ({ priceId: product.priceId, quantity: item.quantity })),
    [lineItems],
  );

  const subtotalCents = lineItems.reduce(
    (sum, { item, product }) => sum + product.priceCents * item.quantity,
    0,
  );

  useEffect(() => {
    if (items.length === 0) navigate({ to: "/merch" });
  }, [items.length, navigate]);

  if (lineItems.length === 0) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <PaymentTestModeBanner />
        <Nav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      <PaymentTestModeBanner />
      <Nav />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          <section>
            <header className="mb-8">
              <p className="text-[10px] tracking-editorial uppercase text-primary mb-3">§ Checkout</p>
              <h1 className="font-display text-4xl md:text-5xl">Complete your order.</h1>
            </header>
            <StripeEmbeddedCheckout items={stripeItems} customerEmail={user?.email} />
          </section>
          <aside className="lg:sticky lg:top-28 self-start border border-border/40 p-6 bg-secondary/20">
            <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-4">
              Order summary
            </p>
            <div className="space-y-4">
              {lineItems.map(({ item, product }) => (
                <div key={item.productId} className="flex gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="w-14 h-14 object-cover border border-border/40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm truncate">{product.name}</p>
                    <p className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-display whitespace-nowrap">
                    {formatPrice(product.priceCents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border/40 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping & tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <Link
              to="/merch"
              className="block mt-6 text-[10px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
            >
              ← Continue shopping
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}