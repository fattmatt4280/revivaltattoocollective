import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Facebook, ArrowLeft } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

type ArtistProfile = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string | null;
  instagram_handles: { handle: string; url: string; platform?: "instagram" | "facebook" | "tiktok" }[];
};

type GalleryImage = {
  id: string;
  public_url: string;
  alt_text: string | null;
  caption: string | null;
};

function optimizeUrl(url: string, width: number, quality = 75): string {
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    `?width=${width}&quality=${quality}`;
}

export const Route = createFileRoute("/artists/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Revival Tattoo Collective` },
      { name: "description", content: "View the full tattoo portfolio from Revival Tattoo Collective." },
    ],
  }),
  component: ArtistPortfolio,
});

function ArtistPortfolio() {
  const { slug } = Route.useParams();

  const { data: artist, isLoading: artistLoading } = useQuery({
    queryKey: ["public-artist", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id,slug,name,specialty,bio,instagram_handles")
        .eq("slug", slug)
        .eq("active", true)
        .single();
      if (error) throw error;
      return data as ArtistProfile;
    },
  });

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ["artist-portfolio", artist?.id],
    enabled: !!artist?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,public_url,alt_text,caption")
        .eq("artist_id", artist!.id)
        .eq("visible", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  if (artistLoading) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <Nav />
        <div className="pt-36 pb-20 mx-auto max-w-[1600px] px-6 md:px-10">
          <div className="h-4 w-24 bg-secondary/40 animate-pulse mb-12" />
          <div className="h-20 w-96 bg-secondary/40 animate-pulse mb-4" />
          <div className="h-3 w-32 bg-secondary/40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <Nav />
        <div className="pt-36 pb-20 mx-auto max-w-[1600px] px-6 md:px-10">
          <p className="text-muted-foreground mb-6">Artist not found.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] tracking-editorial uppercase text-primary hover:text-bone transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Nav />
      <main>
        {/* Header */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-20 border-b border-border">
          <div className="mx-auto max-w-[1600px] px-6 md:px-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors mb-14"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Artists
            </Link>

            <div className="grid grid-cols-12 gap-6 md:gap-10 items-end">
              <div className="col-span-12 md:col-span-7">
                <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
                  § Portfolio
                </p>
                <h1
                  className="font-display text-bone leading-none"
                  style={{ fontSize: "clamp(4rem,11vw,9rem)" }}
                >
                  {artist.name}
                </h1>
                <p className="mt-5 text-[11px] tracking-editorial uppercase text-primary">
                  {artist.specialty}
                </p>
              </div>

              <div className="col-span-12 md:col-span-5">
                {artist.bio && (
                  <p className="text-sm leading-relaxed text-muted-foreground mb-8 max-w-sm">
                    {artist.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
                  {(artist.instagram_handles ?? []).map((h) => (
                    <a
                      key={h.handle}
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
                <a
                  href={`/#book?artist=${artist.slug}`}
                  className="inline-flex items-center gap-4 text-[11px] tracking-editorial uppercase text-bone border border-bone/80 px-5 py-2.5 hover:bg-bone hover:text-ink transition-colors"
                >
                  Book with {artist.name}
                  <span className="text-primary">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-[1600px] px-6 md:px-10">
            {imagesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-secondary/40 animate-pulse" />
                ))}
              </div>
            ) : !images || images.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No portfolio images yet — check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {images.map((img, idx) => (
                  <figure
                    key={img.id}
                    className="relative aspect-[3/4] overflow-hidden bg-secondary group"
                  >
                    <img
                      src={optimizeUrl(img.public_url, 600)}
                      alt={img.alt_text ?? img.caption ?? `${artist.name} tattoo`}
                      loading={idx < 4 ? "eager" : "lazy"}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {img.caption && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-ink/80 px-3 py-2 text-[10px] tracking-editorial uppercase text-bone/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
