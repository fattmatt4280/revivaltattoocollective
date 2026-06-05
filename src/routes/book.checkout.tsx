import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { loadBookingDraft, type BookingDraft } from "@/components/site/BookingForm";
import { createBookingDepositCheckout } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/book/checkout")({
  head: () => ({
    meta: [
      { title: "Booking deposit — Revival Tattoo Collective" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BookCheckoutPage,
});

function BookCheckoutPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    const d = loadBookingDraft();
    if (!d) {
      navigate({ to: "/", hash: "book" });
      return;
    }
    setDraft(d);
  }, [navigate]);

  if (!draft) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <PaymentTestModeBanner />
        <Nav />
      </div>
    );
  }

  const depositLabel = draft.deposit_tier === "full_day" ? "$200" : "$100";
  const tierLabel = draft.deposit_tier === "full_day" ? "Half to full day (4–8 hrs)" : "Half day or less (≤4 hrs)";

  const fetchClientSecret = async (): Promise<string> => {
    const { deposit_tier, ...bookingFields } = draft;
    const result = await createBookingDepositCheckout({
      data: {
        depositTier: deposit_tier,
        bookingDraft: bookingFields,
        returnUrl: `${window.location.origin}/book/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe did not return a client secret");
    return result.clientSecret;
  };

  return (
    <div className="min-h-screen bg-ink text-bone">
      <PaymentTestModeBanner />
      <Nav />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          <section>
            <header className="mb-8">
              <p className="text-[10px] tracking-editorial uppercase text-primary mb-3">§ Booking deposit</p>
              <h1 className="font-display text-4xl md:text-5xl">Secure your sitting.</h1>
            </header>
            <StripeEmbeddedCheckout fetchClientSecret={fetchClientSecret} />
          </section>
          <aside className="lg:sticky lg:top-28 self-start border border-border/40 p-6 bg-secondary/20">
            <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-4">
              Booking summary
            </p>
            <div className="space-y-3 text-sm">
              <Row label="Sitting" value={tierLabel} />
              <Row label="Name" value={draft.contact_name} />
              <Row label="Email" value={draft.contact_email} />
              {draft.preferred_date && <Row label="Preferred date" value={draft.preferred_date} />}
            </div>
            <div className="mt-6 pt-6 border-t border-border/40 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit</span>
                <span className="font-display">{depositLabel}</span>
              </div>
              <p className="text-[10px] tracking-editorial uppercase text-muted-foreground pt-2">
                Non-refundable · applied to final balance
              </p>
            </div>
            <Link
              to="/"
              hash="book"
              className="block mt-6 text-[10px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
            >
              ← Edit booking details
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-editorial uppercase text-muted-foreground">{label}</p>
      <p className="text-bone">{value}</p>
    </div>
  );
}