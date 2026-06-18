import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { useRevealChildren } from "@/hooks/useReveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

function optimizeUrl(url: string, width: number, quality = 80): string {
  return (
    url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    `?width=${width}&quality=${quality}`
  );
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

type Lightbox = { url: string; alt: string; artist: string };

export function Gallery() {
  const containerRef = useRevealChildren(0.1) as React.RefObject<HTMLDivElement>;
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);

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
    acc[a.id] = (allThumbs ?? []).filter((t) => t.artist_id === a.id).slice(0, 8);
    return acc;
  }, {});

  return (
    <>
      <section id="gallery" className="relative bg-ink py-28 md:py-40 border-t border-border">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <div className="flex items-end justify-between mb-16 md:mb-24">
            <div>
              <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
                § Work
              </p>
              <h2 className="font-display text-bone text-5xl md:text-7xl leading-[0.95] max-w-3xl">
                Artist{" "}
                <span className="italic text-muted-foreground">portfolios.</span>
              </h2>
            </div>
            <span className="hidden md:block font-display text-muted-foreground text-sm">
              04 — Work
            </span>
          </div>

          <div ref={containerRef} className="space-y-24 md:space-y-36">
            {artists.map((artist) => {
              const thumbs = thumbsByArtist[artist.id] ?? [];
              if (thumbs.length === 0) return null;

              return (
                <div key={artist.id} className="reveal">
                  {/* Artist label row */}
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <p className="text-[10px] tracking-editorial uppercase text-primary mb-2">
                        {artist.specialty}
                      </p>
                      <h3 className="font-display text-bone text-3xl md:text-5xl leading-none">
                        {artist.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-6">
                      <a
                        href={`/#book?artistId=${artist.id}`}
                        className="hidden sm:inline-flex items-center gap-3 text-[11px] tracking-editorial uppercase px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Book {artist.name}
                      </a>
                      <Link
                        to="/artists/$slug"
                        params={{ slug: artist.slug }}
                        className="inline-flex items-center gap-3 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors border-b border-muted-foreground/30 hover:border-bone/60 pb-1"
                      >
                        Full Portfolio
                        <span className="text-primary">→</span>
                      </Link>
                    </div>
                  </div>

                  {/* Gallery grid — masonry columns */}
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-3">
                    {thumbs.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() =>
                          setLightbox({
                            url: optimizeUrl(img.public_url, 1400),
                            alt: img.alt_text ?? `${artist.name} tattoo`,
                            artist: artist.name,
                          })
                        }
                        className="relative overflow-hidden bg-ink group block mb-2 md:mb-3 break-inside-avoid w-full text-left"
                        aria-label={`View ${img.alt_text ?? artist.name + " tattoo"} in full size`}
                      >
                        <img
                          src={optimizeUrl(img.public_url, 600)}
                          alt={img.alt_text ?? `${artist.name} tattoo`}
                          loading={idx < 3 ? "eager" : "lazy"}
                          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                        {/* Gallery number overlay on hover */}
                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors duration-400 flex items-end justify-end p-3">
                          <span className="text-[10px] tracking-editorial uppercase text-bone/0 group-hover:text-bone/70 transition-colors duration-300 font-mono">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-5xl w-full bg-ink border-border/40 p-0 overflow-hidden">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-bone transition-colors bg-ink/80"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          {lightbox && (
            <div className="relative">
              <img
                src={lightbox.url}
                alt={lightbox.alt}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              {lightbox.alt && (
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-ink/90 to-transparent">
                  <p className="text-[10px] tracking-editorial uppercase text-primary mb-1">
                    {lightbox.artist}
                  </p>
                  <p className="text-sm text-muted-foreground">{lightbox.alt}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
