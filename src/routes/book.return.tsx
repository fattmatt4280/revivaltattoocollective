import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { clearBookingDraft } from "@/components/site/BookingForm";

export const Route = createFileRoute("/book/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Booking received — Revival Tattoo Collective" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BookReturn,
});

function BookReturn() {
  const { session_id: sessionId } = Route.useSearch();

  useEffect(() => {
    if (sessionId) clearBookingDraft();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-16">
        <div className="max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-6" />
          <p className="text-[10px] tracking-editorial uppercase text-primary mb-3">§ Booking received</p>
          <h1 className="font-display text-4xl md:text-5xl mb-6">Your chair is held.</h1>
          <p className="text-muted-foreground mb-8">
            Deposit received. The studio will be in touch within a couple business days to confirm
            your sitting, talk through the design, and lock a date.
          </p>
          {sessionId && (
            <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-8">
              Booking ref: {sessionId.slice(-12)}
            </p>
          )}
          <Link
            to="/"
            className="inline-block text-[11px] tracking-editorial uppercase px-6 py-3 border border-bone/80 text-bone hover:bg-bone hover:text-ink transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}