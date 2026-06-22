import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://revivaltattoocollective.com";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Fetch published blog posts
        const { data: posts } = await supabaseAdmin
          .from("blog_posts")
          .select("slug, updated_at")
          .eq("published", true)
          .order("published_at", { ascending: false });

        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/artists/matt", changefreq: "monthly", priority: "0.9" },
          { path: "/artists/brady", changefreq: "monthly", priority: "0.9" },
          { path: "/merch", changefreq: "weekly", priority: "0.7" },
          { path: "/blog", changefreq: "daily", priority: "0.8" },
        ];

        const blogEntries: SitemapEntry[] = (posts ?? []).map((p) => ({
          path: `/blog/${p.slug}`,
          changefreq: "monthly" as const,
          priority: "0.7",
          lastmod: p.updated_at ? p.updated_at.split("T")[0] : undefined,
        }));

        const entries = [...staticEntries, ...blogEntries];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
