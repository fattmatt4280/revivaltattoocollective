import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STYLES = [
  { value: "color_realism", label: "Color realism" },
  { value: "surrealism", label: "Surrealism" },
  { value: "traditional", label: "American traditional" },
  { value: "lettering", label: "Lettering" },
  { value: "sign_painting", label: "Sign painting" },
  { value: "other", label: "Other / not sure" },
] as const;

export type BookingDraft = {
  artist_id: string | null;
  style: string | null;
  description: string;
  preferred_date: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  reference_image_url: string | null;
  deposit_tier: "half_day" | "full_day";
};

const DRAFT_KEY = "revival.booking.draft";

export function saveBookingDraft(draft: BookingDraft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}
export function loadBookingDraft(): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as BookingDraft) : null;
  } catch {
    return null;
  }
}
export function clearBookingDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

export function BookingForm() {
  const navigate = useNavigate();
  const { data: artists } = useQuery({
    queryKey: ["booking-artists"],
    queryFn: async () => {
      const { data } = await supabase
        .from("artists")
        .select("id,name")
        .eq("active", true)
        .order("display_order");
      return data ?? [];
    },
  });

  const [tier, setTier] = useState<"half_day" | "full_day">("half_day");
  const [artistId, setArtistId] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function uploadReference(): Promise<string | null> {
    if (!referenceFile) return null;
    const ext = referenceFile.name.split(".").pop() ?? "jpg";
    const path = `booking-references/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("revival").upload(path, referenceFile, {
      cacheControl: "3600",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("revival").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Valid email is required");
    if (description.trim().length < 5) return toast.error("Please describe your idea (5+ chars)");

    setSubmitting(true);
    try {
      const referenceUrl = await uploadReference();
      const draft: BookingDraft = {
        artist_id: artistId || null,
        style: style || null,
        description: description.trim(),
        preferred_date: preferredDate || null,
        contact_name: name.trim(),
        contact_email: email.trim(),
        contact_phone: phone.trim() || null,
        reference_image_url: referenceUrl,
        deposit_tier: tier,
      };
      saveBookingDraft(draft);
      navigate({ to: "/book/checkout" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start booking");
      setSubmitting(false);
    }
  }

  const depositLabel = tier === "half_day" ? "$100" : "$200";

  return (
    <section id="book" className="relative bg-secondary/10 py-28 md:py-40 border-t border-border/60">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <div className="mb-12">
          <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">§ Book a sitting</p>
          <h2 className="font-display text-bone text-5xl md:text-6xl leading-[0.95]">
            Reserve <span className="italic text-muted-foreground">the chair.</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl text-sm leading-relaxed">
            A non-refundable deposit holds your slot and is applied toward the final cost of your tattoo.
            Half-day sittings (4 hrs or less) require $100. Half- to full-day sittings (4–8 hrs) require $200.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Sitting length" full>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TierOption
                selected={tier === "half_day"}
                onClick={() => setTier("half_day")}
                title="Half day or less"
                sub="Up to 4 hours · $100 deposit"
              />
              <TierOption
                selected={tier === "full_day"}
                onClick={() => setTier("full_day")}
                title="Half to full day"
                sub="4–8 hours · $200 deposit"
              />
            </div>
          </Field>

          <Field label="Preferred artist">
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className="w-full bg-ink border border-border px-3 py-3 text-sm text-bone"
            >
              <option value="">No preference</option>
              {artists?.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Style">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-ink border border-border px-3 py-3 text-sm text-bone"
            >
              <option value="">Pick a style</option>
              {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <Field label="Describe your idea" full>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={4000}
              className="w-full bg-ink border border-border px-3 py-3 text-sm text-bone"
              placeholder="Subject, size, placement, color vs. black & gray, references…"
            />
          </Field>

          <Field label="Preferred date (optional)">
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full bg-ink border border-border px-3 py-3 text-sm text-bone"
            />
          </Field>

          <Field label="Reference image (optional)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReferenceFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:border file:border-border file:bg-secondary file:text-bone file:text-[11px] file:uppercase file:tracking-editorial"
            />
          </Field>

          <Field label="Your name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="w-full bg-ink border border-border px-3 py-3 text-sm text-bone"
            />
          </Field>

          <Field label="Email">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
              className="w-full bg-ink border border-border px-3 py-3 text-sm text-bone"
            />
          </Field>

          <Field label="Phone (optional)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              className="w-full bg-ink border border-border px-3 py-3 text-sm text-bone"
            />
          </Field>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-4 text-[11px] tracking-editorial uppercase bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Preparing checkout…" : `Continue to deposit — ${depositLabel}`}
            </button>
            <p className="mt-3 text-[10px] tracking-editorial uppercase text-muted-foreground">
              Deposit is non-refundable and applied to your final balance.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-[10px] tracking-editorial uppercase text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}

function TierOption({ selected, onClick, title, sub }: { selected: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border p-4 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border bg-ink hover:border-bone/40"}`}
    >
      <p className="font-display text-lg text-bone">{title}</p>
      <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mt-1">{sub}</p>
    </button>
  );
}