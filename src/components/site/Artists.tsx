import { useRef, useState, useEffect } from "react";
import { Instagram, Facebook } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { useTextScramble } from "@/hooks/useTextScramble";

export type Artist = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  handles: { handle: string; url: string; platform?: "instagram" | "facebook" | "tiktok" }[];
  accentNumber: string;
};

type ThumbImage = { id: string; public_url: string; alt_text: string | null; artist_id: string | null; updated_at?: string | null };

function optimizeUrl(url: string, width: number, quality = 80, cacheKey?: string | null): string {
  const base =
    url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    `?width=${width}&quality=${quality}`;
  return cacheKey ? `${base}&v=${encodeURIComponent(cacheKey)}` : base;
}

function ThumbPlaceholder({ name, idx }: { name: string; idx: number }) {
  return (
    <div
      className="relative aspect-[4/5] overflow-hidden border border-border/60 group/thumb"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.006 20) 0%, oklch(0.13 0.005 20) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-grain opacity-40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        <span className="text-[9px] tracking-editorial uppercase text-muted-foreground/60 mb-2">
          Plate {idx}
        </span>
        <span className="font-display text-bone/70 text-sm">{name}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}

function ArtistImageStrip({
  images,
  artistName,
  artistSlug,
  priority,
}: {
  images: ThumbImage[];
  artistName: string;
  artistSlug: string;
  priority?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 items-start">
      {[0, 1, 2, 3].map((i) => {
        const img = images[i];
        if (img) {
          return (
            <Link
              key={img.id}
              to="/artists/$slug"
              params={{ slug: artistSlug }}
              className="relative aspect-[4/5] overflow-hidden bg-ink border border-border/40 group/thumb block"
            >
              <img
                src={optimizeUrl(img.public_url, 600, 80, img.updated_at ?? img.id)}
                alt={img.alt_text ?? `${artistName} tattoo work`}
                loading={priority && i < 2 ? "eager" : "lazy"}
                fetchPriority={priority && i === 0 ? "high" : "auto"}
                className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover/thumb:scale-[1.03]"
              />
            </Link>
          );
        }
        return <ThumbPlaceholder key={i} name={artistName} idx={i + 1} />;
      })}
    </div>
  );
}

function ScrambledName({ name }: { name: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);
  const display = useTextScramble(name.toUpperCase(), triggered);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <h3
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className="font-display text-bone text-5xl md:text-6xl leading-none"
    >
      {display}
    </h3>
  );
}

function ArtistCard({
  artist,
  images,
  priority,
}: {
  artist: Artist;
  images: ThumbImage[];
  priority?: boolean;
}) {
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef as React.RefObject<HTMLElement>}
      className="group relative border-t border-border pt-10 pb-14 reveal"
    >
      {/* Artwork first — full width image strip */}
      <ArtistImageStrip
        images={images}
        artistName={artist.name}
        artistSlug={artist.slug}
        priority={priority}
      />

      {/* Artist identity below the work */}
      <div className="mt-8 grid grid-cols-12 gap-6 items-start">
        <div className="col-span-1 hidden md:block">
          <span className="font-display text-primary text-xl">{artist.accentNumber}</span>
        </div>

        {/* Name + meta */}
        <header className="col-span-12 md:col-span-4">
          <ScrambledName name={artist.name} />
          <p className="mt-4 text-[11px] tracking-editorial uppercase text-primary">
            {artist.specialty}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-sm">
            {artist.bio}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {artist.handles.map((h, i) => (
              <a
                key={`${h.handle}-${h.platform ?? i}`}
                href={h.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors"
              >
                {h.platform === "facebook" ? (
                  <Facebook className="w-3.5 h-3.5" />
                ) : h.platform === "tiktok" ? (
                  <TikTokIcon size={14} />
                ) : (
                  <Instagram className="w-3.5 h-3.5" />
                )}
                {h.handle}
              </a>
            ))}
          </div>
        </header>

        {/* CTAs */}
        <div className="col-span-12 md:col-span-7 md:col-start-6 flex flex-wrap items-center gap-4 md:justify-end md:pt-2">
          <Link
            to="/artists/$slug"
            params={{ slug: artist.slug }}
            className="inline-flex items-center gap-4 text-[11px] tracking-editorial uppercase text-muted-foreground border border-border px-6 py-3 hover:border-bone/60 hover:text-bone transition-colors"
          >
            View Full Portfolio
            <span>→</span>
          </Link>
          <a
            href={`/#book?artistId=${artist.id}`}
            className="inline-flex items-center gap-4 text-[11px] tracking-editorial uppercase px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Book {artist.name}
            <span className="w-4 h-px bg-current" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function Artists() {
  const { data: artists } = useQuery({
    queryKey: ["public-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id,slug,name,specialty,bio,instagram_handles,display_order")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((a, i) => ({
        id: a.id,
        slug: a.slug,
        name: a.name,
        specialty: a.specialty,
        bio: a.bio ?? "",
        handles: (a.instagram_handles as Artist["handles"]) ?? [],
        accentNumber: String(i + 1).padStart(2, "0"),
      })) as Artist[];
    },
  });

  const { data: allThumbs } = useQuery({
    queryKey: ["all-artist-thumbs"],
    enabled: (artists?.length ?? 0) > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,public_url,alt_text,artist_id,display_order,updated_at")
        .in("artist_id", artists!.map((a) => a.id))
        .eq("visible", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ThumbImage[];
    },
  });

  const thumbsByArtist = (artists ?? []).reduce<Record<string, ThumbImage[]>>(
    (acc, a) => {
      acc[a.id] = (allThumbs ?? []).filter((t) => t.artist_id === a.id).slice(0, 4);
      return acc;
    },
    {}
  );

  return (
    <section id="artists" className="relative bg-ink py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
              § Roster
            </p>
            <h2 className="font-display text-bone text-5xl md:text-7xl leading-[0.95] max-w-3xl">
              2 styles,{" "}
              <span className="italic text-muted-foreground">1 obsession.</span>
            </h2>
          </div>
          <span className="hidden md:block font-display text-muted-foreground text-sm">
            02 — Collective
          </span>
        </div>

        <div>
          {(artists ?? []).map((a, idx) => (
            <ArtistCard
              key={a.slug}
              artist={a}
              images={thumbsByArtist[a.id] ?? []}
              priority={idx === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
