import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type HeroImage = { id: string; public_url: string; alt_text: string | null };

function optimizeUrl(url: string, width: number) {
  return (
    url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    `?width=${width}&quality=80`
  );
}

export function Hero() {
  const { data: images } = useQuery({
    queryKey: ["hero-gallery-images"],
    queryFn: async () => {
      // Fetch active artists first so we can pull one image per artist
      const { data: artists } = await supabase
        .from("artists")
        .select("id")
        .eq("active", true)
        .order("display_order", { ascending: true })
        .limit(4);

      if (!artists || artists.length === 0) return [];

      // One best image per artist (lowest display_order, then newest)
      const perArtist = await Promise.all(
        artists.map(async (a) => {
          const { data } = await supabase
            .from("gallery_images")
            .select("id,public_url,alt_text")
            .eq("artist_id", a.id)
            .eq("visible", true)
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false })
            .limit(1);
          return data?.[0] ?? null;
        })
      );

      return perArtist.filter(Boolean) as HeroImage[];
    },
  });

  const imgs = images ?? [];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-grain opacity-60 pointer-events-none" />

      {/* Top label bar */}
      <div className="absolute top-24 left-0 right-0 z-10 px-6 md:px-10">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between text-[10px] tracking-editorial uppercase text-muted-foreground">
          <span>Largo, FL — Est. Collective</span>
          <span className="hidden md:inline">
            Tattoo · Sign Painting · Lettering · Color Realism
          </span>
          <span>N° 001</span>
        </div>
      </div>

      {/* Two-column layout — grid-rows-[100%] forces the single row to fill the h-full container */}
      <div className="relative z-10 h-full grid grid-rows-[100%] grid-cols-1 lg:grid-cols-[1fr_1.3fr]">
        {/* Left — editorial text */}
        <div className="flex flex-col justify-center min-h-0 pt-36 pb-28 lg:pt-28 lg:pb-20 px-6 md:px-10 lg:pl-10 lg:pr-10">
          <div className="max-w-lg">
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-8 animate-fade-in">
              Revival Tattoo Collective
            </p>

            <h1 className="font-display text-bone leading-[0.92] tracking-[-0.02em] animate-fade-up">
              <span className="block text-[clamp(3.2rem,8vw,7.5rem)] font-normal">
                Ink as
              </span>
              <span className="block text-[clamp(3.2rem,8vw,7.5rem)] italic font-light text-muted-foreground">
                artifact.
              </span>
            </h1>

            <p
              className="mt-8 text-base text-muted-foreground leading-relaxed animate-fade-up max-w-sm"
              style={{ animationDelay: "0.2s" }}
            >
              Expert tattoo and sign painting in Largo, Florida. A
              gallery-forward studio where editorial restraint meets the
              physicality of the needle.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <a
                href="/#book"
                className="btn-shimmer group inline-flex items-center gap-4 px-8 py-4 bg-bone text-ink text-[11px] tracking-editorial uppercase font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Reserve a Session
                <span className="w-6 h-px bg-current transition-all group-hover:w-10" />
              </a>
              <a
                href="#artists"
                className="text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
              >
                Browse the Work →
              </a>
            </div>
          </div>
        </div>

        {/* Right — 2×2 square grid */}
        <div className="hidden lg:flex items-center justify-center px-4 pl-2 overflow-hidden h-full">
          <div className="grid grid-cols-2 gap-2 w-full max-w-xl">
            {imgs.slice(0, 4).map((img, i) => (
              <a
                key={img.id}
                href="#gallery"
                className="relative block aspect-square overflow-hidden rounded-xl"
              >
                <img
                  src={optimizeUrl(img.public_url, 600)}
                  alt={img.alt_text ?? "Revival Tattoo Collective"}
                  loading={i < 2 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="absolute inset-0 w-full h-full object-cover block"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/40 py-5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-12 px-6 text-[11px] tracking-editorial uppercase text-muted-foreground"
            >
              <span>Walk-Ins by Appointment</span>
              <span className="text-primary">◆</span>
              <span>Color Realism — Matt</span>
              <span className="text-primary">◆</span>
              <span>Traditional — Ashlyn</span>
              <span className="text-primary">◆</span>
              <span>Lettering — Brady</span>
              <span className="text-primary">◆</span>
              <span>Revival Tattoo Collective</span>
              <span className="text-primary">◆</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
