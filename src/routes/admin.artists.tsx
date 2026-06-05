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
import { Trash2, Plus, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

type Artist = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  bio: string | null;
  instagram_handles: { handle: string; url: string; platform?: "instagram" | "facebook" | "tiktok" }[];
  display_order: number;
  active: boolean;
};

export const Route = createFileRoute("/admin/artists")({
  component: ArtistsAdmin,
});

function ArtistsAdmin() {
  const qc = useQueryClient();
  const { data: artists, isLoading } = useQuery({
    queryKey: ["admin-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Artist[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-artists"] });

  const addArtist = async () => {
    const slug = `artist-${Date.now()}`;
    const order = (artists?.length ?? 0) + 1;
    const { error } = await supabase.from("artists").insert({
      slug,
      name: "New Artist",
      specialty: "Specialty",
      bio: "",
      instagram_handles: [],
      display_order: order,
      active: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Artist draft created");
    refresh();
  };

  return (
    <AdminShell title="Artists" subtitle="Edit bios, specialties, social links, and visibility.">
      <div className="flex justify-end mb-6">
        <Button
          onClick={addArtist}
          className="rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]"
        >
          <Plus className="w-4 h-4 mr-2" /> New Artist
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

      <div className="space-y-6">
        {artists?.map((a, i) => (
          <ArtistEditor
            key={a.id}
            artist={a}
            isFirst={i === 0}
            isLast={i === (artists?.length ?? 0) - 1}
            onChanged={refresh}
          />
        ))}
      </div>
    </AdminShell>
  );
}

function ArtistEditor({
  artist,
  isFirst,
  isLast,
  onChanged,
}: {
  artist: Artist;
  isFirst: boolean;
  isLast: boolean;
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState(artist);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof Artist>(k: K, v: Artist[K]) => setDraft({ ...draft, [k]: v });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("artists")
      .update({
        slug: draft.slug,
        name: draft.name,
        specialty: draft.specialty,
        bio: draft.bio,
        instagram_handles: draft.instagram_handles,
        active: draft.active,
      })
      .eq("id", draft.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${draft.name} saved`);
    onChanged();
  };

  const remove = async () => {
    if (!confirm(`Delete ${draft.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("artists").delete().eq("id", draft.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged();
  };

  const move = async (dir: -1 | 1) => {
    const { error } = await supabase
      .from("artists")
      .update({ display_order: draft.display_order + dir })
      .eq("id", draft.id);
    if (error) return toast.error(error.message);
    onChanged();
  };

  const addHandle = () =>
    update("instagram_handles", [
      ...(draft.instagram_handles ?? []),
      { platform: "instagram", handle: "@", url: "https://instagram.com/" },
    ]);

  const updateHandle = (
    i: number,
    key: "handle" | "url" | "platform",
    v: string,
  ) => {
    const next = [...(draft.instagram_handles ?? [])];
    next[i] = { ...next[i], [key]: v } as Artist["instagram_handles"][number];
    update("instagram_handles", next);
  };

  const removeHandle = (i: number) => {
    const next = [...(draft.instagram_handles ?? [])];
    next.splice(i, 1);
    update("instagram_handles", next);
  };

  return (
    <div className="border border-border bg-secondary/30 p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="font-display text-3xl text-bone">{draft.name || "Untitled"}</span>
          {!draft.active && (
            <span className="text-[10px] tracking-editorial uppercase text-muted-foreground border border-border px-2 py-1">
              Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" disabled={isFirst} onClick={() => move(-1)} className="rounded-none">
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" disabled={isLast} onClick={() => move(1)} className="rounded-none">
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={remove} className="rounded-none text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <Input value={draft.name} onChange={(e) => update("name", e.target.value)} className="rounded-none bg-ink border-border" />
        </Field>
        <Field label="Slug (URL)">
          <Input value={draft.slug} onChange={(e) => update("slug", e.target.value)} className="rounded-none bg-ink border-border" />
        </Field>
        <Field label="Specialty">
          <Input value={draft.specialty} onChange={(e) => update("specialty", e.target.value)} className="rounded-none bg-ink border-border" />
        </Field>
        <Field label="Visible on site">
          <div className="h-10 flex items-center">
            <Switch checked={draft.active} onCheckedChange={(v) => update("active", v)} />
          </div>
        </Field>
        <div className="md:col-span-2">
          <Field label="Bio">
            <Textarea
              rows={4}
              value={draft.bio ?? ""}
              onChange={(e) => update("bio", e.target.value)}
              className="rounded-none bg-ink border-border"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-[10px] tracking-editorial uppercase text-muted-foreground">Social Handles</Label>
            <Button size="sm" variant="outline" onClick={addHandle} className="rounded-none text-[10px] tracking-editorial uppercase">
              <Plus className="w-3 h-3 mr-1" /> Add handle
            </Button>
          </div>
          <div className="space-y-2">
            {(draft.instagram_handles ?? []).map((h, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select
                  value={h.platform ?? "instagram"}
                  onChange={(e) => updateHandle(i, "platform", e.target.value)}
                  className="col-span-2 h-10 rounded-none bg-ink border border-border text-bone text-xs px-2 tracking-editorial uppercase"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                </select>
                <Input
                  value={h.handle}
                  onChange={(e) => updateHandle(i, "handle", e.target.value)}
                  placeholder="@handle"
                  className="col-span-3 rounded-none bg-ink border-border"
                />
                <Input
                  value={h.url}
                  onChange={(e) => updateHandle(i, "url", e.target.value)}
                  placeholder="https://..."
                  className="col-span-6 rounded-none bg-ink border-border"
                />
                <Button size="icon" variant="outline" onClick={() => removeHandle(i)} className="rounded-none">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={save}
          disabled={saving}
          className="rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] tracking-editorial uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}