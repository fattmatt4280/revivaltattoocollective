import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Users, Image, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [artists, gallery, bookings, newBookings] = await Promise.all([
        supabase.from("artists").select("id", { count: "exact", head: true }),
        supabase.from("gallery_images").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return {
        artists: artists.count ?? 0,
        gallery: gallery.count ?? 0,
        bookings: bookings.count ?? 0,
        newBookings: newBookings.count ?? 0,
      };
    },
  });

  const stats = [
    { label: "Artists", value: data?.artists ?? "—", icon: Users },
    { label: "Gallery Images", value: data?.gallery ?? "—", icon: Image },
    { label: "Total Bookings", value: data?.bookings ?? "—", icon: CalendarDays },
    { label: "New Inquiries", value: data?.newBookings ?? "—", icon: CalendarDays, accent: true },
  ];

  return (
    <AdminShell title="Overview" subtitle="A snapshot of the studio's editorial state.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`border p-6 ${s.accent ? "border-primary/60 bg-primary/5" : "border-border bg-secondary/30"}`}
            >
              <div className="flex items-center justify-between text-[10px] tracking-editorial uppercase text-muted-foreground mb-6">
                <span>{s.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-display text-bone text-5xl">{s.value}</p>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}