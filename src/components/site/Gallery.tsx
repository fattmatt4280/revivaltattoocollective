import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type GalleryRow = {
  id: string;
  public_url: string;
  alt_text: string | null;
  caption: string | null;
};

export function Gallery() {
  const { data: images, isLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,public_url,alt_text,caption")
        .eq("visible", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data as GalleryRow[];
    },
  });

  if (!isLoading && (!images || images.length === 0)) return null;

  return (
    <section id="gallery" className="relative bg-ink py-28 md:py-40 border-t border-border">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex items-end justify-between mb-16 md:mb-24">
          <div>
            <p className="text-[11px] tracking-editorial uppercase text-primary mb-6">
              § Portfolio
            </p>
            <h2 className="font-display text-bone text-5xl md:text-7xl leading-[0.95] max-w-3xl">
              Recent <span className="italic text-muted-foreground">work.</span>
            </h2>
          </div>
          <span className="hidden md:block font-display text-muted-foreground text-sm">
            04 — Gallery
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images!.map((img) => (
              <figure key={img.id} className="relative aspect-square overflow-hidden bg-secondary group">
                <img
                  src={img.public_url}
                  alt={img.alt_text ?? img.caption ?? "Tattoo work"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}