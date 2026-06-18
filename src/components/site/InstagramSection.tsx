import { Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Handle = { handle: string; url: string; platform?: string };

export function InstagramSection() {
  const { data: artists } = useQuery({
    queryKey: ["public-artists-ig"],
    queryFn: async () => {
      const { data } = await supabase
        .from("artists")
        .select("id,name,specialty,instagram_handles")
        .eq("active", true)
        .order("display_order", { ascending: true });
      return (data ?? []).map((a) => ({
        name: a.name,
        specialty: a.specialty,
        handles: ((a.instagram_handles as Handle[]) ?? []).filter(
          (h) => !h.platform || h.platform === "instagram"
        ),
      }));
    },
  });

  const cards = (artists ?? [])
    .map((a) => ({ ...a, ig: a.handles[0] }))
    .filter((a) => a.ig);

  if (cards.length === 0) return null;

  return (
    <section className="relative bg-ink py-28 md:py-40 border-t border-border/60">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex items-end justify-between mb-16 md:mb-20">
          <div>
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
              § Follow the work
            </p>
            <h2 className="font-display text-bone text-5xl md:text-7xl leading-[0.95]">
              Daily ink,{" "}
              <span className="italic text-muted-foreground">on Instagram.</span>
            </h2>
          </div>
          <span className="hidden md:block font-display text-muted-foreground text-sm">
            § Social
          </span>
        </div>

        <div
          className={`grid gap-px border border-border/40 ${
            cards.length === 1
              ? "grid-cols-1"
              : cards.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {cards.map(({ name, specialty, ig }) => (
            <a
              key={ig.handle}
              href={ig.url}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col justify-between p-10 md:p-14 border border-border/40 bg-ink hover:bg-secondary/10 transition-colors duration-300 min-h-[260px]"
            >
              <div>
                <p className="text-[10px] tracking-editorial uppercase text-primary mb-5">
                  {specialty}
                </p>
                <p className="font-display text-bone text-4xl md:text-5xl leading-none tracking-[-0.02em] group-hover:text-primary transition-colors duration-300">
                  @{ig.handle.replace(/^@/, "")}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{name}</p>
              </div>

              <div className="mt-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-3 text-[11px] tracking-editorial uppercase text-muted-foreground group-hover:text-bone transition-colors">
                  Follow on Instagram
                  <span className="inline-block w-4 h-px bg-current transition-all duration-300 group-hover:w-10" />
                </span>
                <Instagram className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors duration-300" />
              </div>
            </a>
          ))}
        </div>

        <p className="mt-8 text-[10px] tracking-editorial uppercase text-muted-foreground/50">
          New work posted weekly — follow for flash availability and project updates
        </p>
      </div>
    </section>
  );
}
