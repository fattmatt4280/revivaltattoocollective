import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

function optimizeUrl(url: string, width: number, quality = 75): string {
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    `?width=${width}&quality=${quality}`;
}

type ArtistPreview = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
};

type ThumbImage = {
  id: string;
  public_url: string;
  alt_text: string | null;
  artist_id: string | null;
};

export function Gallery() {
  const { data: artists } = useQuery({
    queryKey: ["public-artists-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id,slug,name,specialty,display_order")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ArtistPreview[];
    },
  });

  const { data: allThumbs } = useQuery({
    queryKey: ["gallery-artist-thumbs"],
    enabled: (artists?.length ?? 0) > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,public_url,alt_text,artist_id,display_order")
        .in("artist_id", artists!.map((a) => a.id))
        .eq("visible", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ThumbImage[];
    },
  });

  if (!artists || artists.length === 0) return null;

  const thumbsByArtist = artists.reduce<Record<string, ThumbImage[]>>((acc, a) => {
    acc[a.id] = (allThumbs ?? []).filter((t) => t.artist_id === a.id).slice(0, 6);
    return acc;
  }, {});

  return (
    <section id="gallery" className="relative bg-ink py-28 md:py-40 border-t border-border">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex items-end justify-between mb-16 md:mb-24">
          <div>
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
              § Work
            </p>
            <h2 className="font-display text-bone text-5xl md:text-7xl leading-[0.95] max-w-3xl">
              Artist <span className="italic text-muted-foreground">portfolios.</span>
            </h2>
          </div>
          <span className="hidden md:block font-display text-muted-foreground text-sm">
            04 — Work
          </span>
        </div>

        <div className="space-y-20 md:space-y-28">
          {artists.map((artist) => {
            const thumbs = thumbsByArtist[artist.id] ?? [];
            if (thumbs.length === 0) return null;

            return (
              <div key={artist.id}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[10px] tracking-editorial uppercase text-primary mb-2">
                      {artist.specialty}
                    </p>
                    <h3 className="font-display text-bone text-3xl md:text-4xl leading-none">
                      {artist.name}
                    </h3>
                  </div>
                  <Link
                    to="/artists/$slug"
                    params={{ slug: artist.slug }}
                    className="inline-flex items-center gap-3 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors border-b border-muted-foreground/30 hover:border-bone/60 pb-1"
                  >
                    Full Portfolio
                    <span className="text-primary">→</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                  {thumbs.map((img, idx) => (
                    <Link
                      key={img.id}
                      to="/artists/$slug"
                      params={{ slug: artist.slug }}
                      className="relative aspect-square overflow-hidden bg-secondary group block"
                    >
                      <img
                        src={optimizeUrl(img.public_url, 400)}
                        alt={img.alt_text ?? `${artist.name} tattoo`}
                        loading={idx < 2 ? "eager" : "lazy"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
