import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CalendarDays, Tag } from "lucide-react";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string;
  tags: string[];
  published_at: string | null;
};

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Tattoo Blog — Revival Tattoo Collective | Largo, FL" },
      {
        name: "description",
        content:
          "Tattoo aftercare tips, style guides, artist spotlights, and local insights from Revival Tattoo Collective — Largo, FL's award-winning custom tattoo studio.",
      },
      { property: "og:title", content: "Tattoo Blog — Revival Tattoo Collective" },
      {
        property: "og:description",
        content:
          "Aftercare guides, tattoo style breakdowns, and studio insights from Largo FL's top tattoo artists.",
      },
      { property: "og:url", content: "https://revivaltattoocollective.com/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://revivaltattoocollective.com/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-listing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image_url, author_name, tags, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BlogPost[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const [featured, ...rest] = posts ?? [];

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Nav />
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          {/* Header */}
          <header className="mb-16 max-w-2xl">
            <p className="text-[10px] tracking-editorial uppercase text-primary mb-4">Studio Notes</p>
            <h1 className="font-display text-5xl md:text-7xl text-bone leading-[0.95]">
              Tattoo<br />
              <span className="italic text-muted-foreground">Insights.</span>
            </h1>
            <p className="mt-6 text-muted-foreground max-w-md">
              Aftercare guides, style breakdowns, artist spotlights, and local knowledge from Revival
              Tattoo Collective in Largo, FL.
            </p>
          </header>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-secondary/40 h-52 w-full mb-4" />
                  <div className="bg-secondary/40 h-4 w-3/4 mb-2" />
                  <div className="bg-secondary/40 h-3 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Featured post */}
          {featured && !isLoading && (
            <Link to="/blog/$slug" params={{ slug: featured.slug }} className="block mb-14 group">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border/60 hover:border-border transition-colors">
                <div className="bg-secondary/30 h-64 lg:h-auto min-h-[260px] flex items-center justify-center overflow-hidden">
                  {featured.cover_image_url ? (
                    <img
                      src={featured.cover_image_url}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <span className="font-display text-7xl text-border/40 select-none">R</span>
                  )}
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  {featured.tags?.[0] && (
                    <p className="text-[10px] tracking-editorial uppercase text-primary mb-4">
                      {featured.tags[0]}
                    </p>
                  )}
                  <h2 className="font-display text-3xl md:text-4xl text-bone leading-tight group-hover:text-primary transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="mt-6 flex items-center gap-4 text-[10px] tracking-editorial uppercase text-muted-foreground">
                    {featured.published_at && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(featured.published_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    <span className="text-primary">Read →</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          {rest.length > 0 && !isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {!isLoading && (posts ?? []).length === 0 && (
            <p className="text-muted-foreground text-sm py-12">No posts yet. Check back soon.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block">
      <div className="overflow-hidden bg-secondary/20 border border-transparent group-hover:border-border/60 transition-colors mb-4 h-48">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-5xl text-border/30 select-none">R</span>
          </div>
        )}
      </div>

      {post.tags?.[0] && (
        <p className="text-[10px] tracking-editorial uppercase text-primary mb-2">{post.tags[0]}</p>
      )}

      <h3 className="font-display text-xl text-bone leading-snug group-hover:text-primary transition-colors mb-2">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
      )}

      <div className="mt-3 flex items-center gap-3 text-[10px] tracking-editorial uppercase text-muted-foreground/60">
        {post.published_at && (
          <span>
            {new Date(post.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  );
}
