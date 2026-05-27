import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Thank you — Revival Tattoo Collective" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (sessionId) clearCart();
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-16">
        <div className="max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-6" />
          <p className="text-[10px] tracking-editorial uppercase text-primary mb-3">§ Order received</p>
          <h1 className="font-display text-4xl md:text-5xl mb-6">Thank you.</h1>
          <p className="text-muted-foreground mb-8">
            Your order is in. We've sent a confirmation to your email and the studio is packing
            your prints. You'll get a shipping notification with tracking when it goes out.
          </p>
          {sessionId && (
            <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-8">
              Order ref: {sessionId.slice(-12)}
            </p>
          )}
          <Link
            to="/merch"
            className="inline-block text-[11px] tracking-editorial uppercase px-6 py-3 border border-bone/80 text-bone hover:bg-bone hover:text-ink transition-colors"
          >
            Back to shop
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}