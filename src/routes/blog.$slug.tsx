import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CalendarDays, ArrowLeft } from "lucide-react";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
};

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Revival Tattoo Collective` },
      { property: "og:url", content: `https://revivaltattoocollective.com/blog/${params.slug}` },
      { property: "og:type", content: "article" },
    ],
    links: [
      { rel: "canonical", href: `https://revivaltattoocollective.com/blog/${params.slug}` },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) return null;
      return data as unknown as BlogPost;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["blog-related", slug],
    enabled: !!post,
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, published_at, tags")
        .eq("published", true)
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(3);
      return (data ?? []) as unknown as Pick<BlogPost, "id" | "slug" | "title" | "published_at" | "tags">[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <Nav />
        <main className="pt-32 pb-24">
          <div className="mx-auto max-w-3xl px-6 md:px-10">
            <div className="animate-pulse space-y-4">
              <div className="bg-secondary/40 h-6 w-1/3" />
              <div className="bg-secondary/40 h-12 w-3/4" />
              <div className="bg-secondary/40 h-4 w-full" />
              <div className="bg-secondary/40 h-4 w-5/6" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-ink text-bone">
        <Nav />
        <main className="pt-32 pb-24">
          <div className="mx-auto max-w-3xl px-6 md:px-10 text-center">
            <h1 className="font-display text-5xl text-bone mb-4">Post not found</h1>
            <Link to="/" className="text-[11px] tracking-editorial uppercase text-primary hover:text-bone transition-colors">
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      <Nav />
      <main className="pt-32 pb-24">
        {/* Cover image */}
        {post.cover_image_url && (
          <div className="mx-auto max-w-[1600px] px-6 md:px-10 mb-12">
            <div className="h-64 md:h-96 overflow-hidden">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-6 md:px-10">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] tracking-editorial uppercase text-muted-foreground hover:text-bone transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] tracking-editorial uppercase text-primary border border-primary/30 px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl text-bone leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] tracking-editorial uppercase text-muted-foreground mb-10 pb-10 border-b border-border/40">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            <span>By {post.author_name}</span>
          </div>

          {/* Content */}
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:text-bone prose-headings:font-normal
              prose-h2:text-3xl prose-h3:text-xl
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:text-bone
              prose-strong:text-bone prose-strong:font-medium
              prose-ul:text-muted-foreground prose-ol:text-muted-foreground
              prose-li:marker:text-primary
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              prose-hr:border-border/40"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA */}
          <div className="mt-16 pt-12 border-t border-border/40">
            <p className="text-[10px] tracking-editorial uppercase text-primary mb-3">Book Now</p>
            <h2 className="font-display text-3xl text-bone mb-4">
              Ready to start your next tattoo?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Revival Tattoo Collective is Largo, FL's award-winning custom studio. Walk-ins
              welcome — appointments recommended.
            </p>
            <a href="/#book" className="btn-liquid inline-flex items-center gap-3 px-6 py-3 text-[11px] tracking-editorial uppercase">
              Reserve a Session <span className="text-primary/80">→</span>
            </a>
          </div>

          {/* Related posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border/40">
              <p className="text-[10px] tracking-editorial uppercase text-muted-foreground mb-8">
                More from the blog
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.id}
                    to="/blog/$slug"
                    params={{ slug: r.slug }}
                    className="group block"
                  >
                    {r.tags?.[0] && (
                      <p className="text-[10px] tracking-editorial uppercase text-primary mb-1">
                        {r.tags[0]}
                      </p>
                    )}
                    <h4 className="font-display text-lg text-bone leading-snug group-hover:text-primary transition-colors">
                      {r.title}
                    </h4>
                    {r.published_at && (
                      <p className="text-[10px] tracking-editorial uppercase text-muted-foreground/50 mt-2">
                        {new Date(r.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
