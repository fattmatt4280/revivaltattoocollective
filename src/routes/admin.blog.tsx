import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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
  created_at: string;
  updated_at: string;
};

export const Route = createFileRoute("/admin/blog")({
  head: () => ({
    meta: [{ title: "Blog — Revival Admin" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: BlogAdmin,
});

function BlogAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: true });
      if (error) throw error;
      return data as unknown as BlogPost[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-blog"] });

  const createPost = async () => {
    const slug = `new-post-${Date.now()}`;
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({ slug, title: "New Post", content: "", author_name: "Revival Tattoo Collective", tags: [], published: false })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    toast.success("Draft created");
    refresh();
    setExpandedId((data as { id: string }).id);
  };

  const filtered = (posts ?? []).filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.includes(search.toLowerCase()),
  );

  const published = filtered.filter((p) => p.published).length;

  return (
    <AdminShell title="Blog" subtitle={`${posts?.length ?? 0} posts · ${published} published`}>
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <Input
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-none bg-ink border-border max-w-xs"
        />
        <Button
          onClick={createPost}
          className="rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]"
        >
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

      <div className="space-y-1">
        {filtered.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            expanded={expandedId === post.id}
            onToggle={() => setExpandedId(expandedId === post.id ? null : post.id)}
            onChanged={refresh}
          />
        ))}
        {!isLoading && filtered.length === 0 && (
          <p className="text-muted-foreground text-sm py-12 text-center">No posts found.</p>
        )}
      </div>
    </AdminShell>
  );
}

function PostRow({
  post,
  expanded,
  onToggle,
  onChanged,
}: {
  post: BlogPost;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState(post);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof BlogPost>(k: K, v: BlogPost[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("blog_posts")
      .update({
        slug: draft.slug,
        title: draft.title,
        excerpt: draft.excerpt,
        content: draft.content,
        cover_image_url: draft.cover_image_url,
        author_name: draft.author_name,
        tags: draft.tags,
        published: draft.published,
        published_at: draft.published
          ? draft.published_at || new Date().toISOString()
          : null,
      })
      .eq("id", draft.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onChanged();
  };

  const remove = async () => {
    if (!confirm("Delete this post? Cannot be undone.")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", draft.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  };

  return (
    <div className="border border-border bg-secondary/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
      >
        <span
          className={`shrink-0 w-2 h-2 rounded-full ${post.published ? "bg-green-500" : "bg-muted-foreground/40"}`}
        />
        <span className="flex-1 text-sm text-bone truncate">{post.title}</span>
        <span className="shrink-0 text-[10px] tracking-editorial uppercase text-muted-foreground hidden sm:block">
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "draft"}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-5 border-t border-border/40 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title">
              <Input
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                className="rounded-none bg-ink border-border"
              />
            </Field>
            <Field label="Slug (URL path)">
              <Input
                value={draft.slug}
                onChange={(e) => update("slug", e.target.value)}
                className="rounded-none bg-ink border-border"
              />
            </Field>
            <Field label="Author">
              <Input
                value={draft.author_name}
                onChange={(e) => update("author_name", e.target.value)}
                className="rounded-none bg-ink border-border"
              />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input
                value={(draft.tags ?? []).join(", ")}
                onChange={(e) =>
                  update(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
                className="rounded-none bg-ink border-border"
              />
            </Field>
            <Field label="Cover Image URL">
              <Input
                value={draft.cover_image_url ?? ""}
                onChange={(e) => update("cover_image_url", e.target.value || null)}
                className="rounded-none bg-ink border-border"
              />
            </Field>
            <Field label="Published At">
              <Input
                type="datetime-local"
                value={draft.published_at ? draft.published_at.slice(0, 16) : ""}
                onChange={(e) =>
                  update("published_at", e.target.value ? new Date(e.target.value).toISOString() : null)
                }
                className="rounded-none bg-ink border-border"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Excerpt">
                <Textarea
                  rows={2}
                  value={draft.excerpt ?? ""}
                  onChange={(e) => update("excerpt", e.target.value || null)}
                  className="rounded-none bg-ink border-border"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Content (HTML)">
                <Textarea
                  rows={16}
                  value={draft.content}
                  onChange={(e) => update("content", e.target.value)}
                  className="rounded-none bg-ink border-border font-mono text-xs leading-relaxed"
                />
              </Field>
            </div>
            <Field label="Published">
              <div className="h-10 flex items-center gap-3">
                <Switch
                  checked={draft.published}
                  onCheckedChange={(v) => update("published", v)}
                />
                <span className="text-xs text-muted-foreground">
                  {draft.published ? "Live" : "Draft"}
                </span>
              </div>
            </Field>
            {draft.published && (
              <Field label="View">
                <div className="h-10 flex items-center">
                  <a
                    href={`/blog/${draft.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] tracking-editorial uppercase text-primary hover:text-bone transition-colors"
                  >
                    Open post <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Field>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={remove}
              className="rounded-none text-destructive border-destructive/30 text-[10px] tracking-editorial uppercase"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] tracking-editorial uppercase text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
