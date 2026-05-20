import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = ["new", "reviewing", "confirmed", "declined", "completed"] as const;
type Status = typeof STATUSES[number];

type Booking = {
  id: string;
  artist_id: string | null;
  style: string | null;
  description: string;
  preferred_date: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  reference_image_url: string | null;
  status: Status;
  created_at: string;
};

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsAdmin,
});

function BookingsAdmin() {
  const qc = useQueryClient();

  const { data: artists } = useQuery({
    queryKey: ["all-artists-min"],
    queryFn: async () => {
      const { data } = await supabase.from("artists").select("id,name");
      return data ?? [];
    },
  });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Booking[];
    },
  });

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const artistName = (id: string | null) => artists?.find((a) => a.id === id)?.name ?? "—";

  return (
    <AdminShell title="Bookings" subtitle="Incoming appointment requests.">
      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

      {bookings && bookings.length === 0 && (
        <div className="border border-dashed border-border p-16 text-center text-muted-foreground text-sm">
          No bookings yet.
        </div>
      )}

      <div className="space-y-3">
        {bookings?.map((b) => (
          <div key={b.id} className="border border-border bg-secondary/30 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-display text-2xl text-bone">{b.contact_name}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-[11px] tracking-editorial uppercase text-muted-foreground">
                  <a href={`mailto:${b.contact_email}`} className="hover:text-bone">{b.contact_email}</a>
                  {b.contact_phone && <span>{b.contact_phone}</span>}
                  <span>·</span>
                  <span>{new Date(b.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as Status)}>
                <SelectTrigger className="w-40 rounded-none bg-ink border-border text-[11px] tracking-editorial uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
              <Meta label="Artist">{artistName(b.artist_id)}</Meta>
              <Meta label="Style">{b.style ?? "—"}</Meta>
              <Meta label="Preferred Date">{b.preferred_date ?? "Flexible"}</Meta>
              <Meta label="Reference">
                {b.reference_image_url ? (
                  <a href={b.reference_image_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    View
                  </a>
                ) : "—"}
              </Meta>
            </div>

            <div>
              <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-bone whitespace-pre-wrap">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-bone">{children}</p>
    </div>
  );
}