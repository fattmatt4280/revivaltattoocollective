import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

const STYLES = [
  { value: "color_realism", label: "Color Realism" },
  { value: "surrealism", label: "Surrealism" },
  { value: "traditional", label: "Traditional" },
  { value: "lettering", label: "Lettering" },
  { value: "sign_painting", label: "Sign Painting" },
  { value: "other", label: "Other" },
] as const;

type Artist = { id: string; name: string };
type GalleryImage = {
  id: string;
  artist_id: string | null;
  public_url: string;
  storage_path: string;
  style: typeof STYLES[number]["value"];
  caption: string | null;
  alt_text: string | null;
  visible: boolean;
  display_order: number;
};

export const Route = createFileRoute("/admin/gallery")({
  component: GalleryAdmin,
});

function GalleryAdmin() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [filterArtist, setFilterArtist] = useState<string>("all");

  const { data: artists } = useQuery({
    queryKey: ["all-artists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("artists").select("id,name").order("display_order");
      if (error) throw error;
      return data as Artist[];
    },
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ["admin-gallery", filterArtist],
    queryFn: async () => {
      let q = supabase.from("gallery_images").select("*").order("display_order", { ascending: true });
      if (filterArtist !== "all") q = q.eq("artist_id", filterArtist);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as GalleryImage[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-gallery"] });

  const onUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `gallery/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("revival").upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
        });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("revival").getPublicUrl(path);
        const { error: insErr } = await supabase.from("gallery_images").insert({
          storage_path: path,
          public_url: publicUrl,
          style: "other",
          alt_text: file.name,
          visible: true,
          display_order: (images?.length ?? 0) + 1,
          artist_id: filterArtist !== "all" ? filterArtist : null,
        });
        if (insErr) throw insErr;
      }
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <AdminShell title="Gallery" subtitle="Upload, tag, and curate the portfolio. Drag-free reorder by display number.">
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <div className="space-y-2">
          <Label className="text-[10px] tracking-editorial uppercase text-muted-foreground">Filter by artist</Label>
          <Select value={filterArtist} onValueChange={setFilterArtist}>
            <SelectTrigger className="w-56 rounded-none bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All artists</SelectItem>
              {artists?.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && onUpload(e.target.files)}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading…" : "Upload images"}
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images?.map((img) => (
          <ImageCard key={img.id} image={img} artists={artists ?? []} onChanged={refresh} />
        ))}
      </div>

      {images && images.length === 0 && !isLoading && (
        <div className="border border-dashed border-border p-16 text-center text-muted-foreground">
          <p className="text-sm">No images yet. Upload to begin building the gallery.</p>
        </div>
      )}
    </AdminShell>
  );
}

function ImageCard({
  image, artists, onChanged,
}: { image: GalleryImage; artists: Artist[]; onChanged: () => void }) {
  const [draft, setDraft] = useState(image);
  const [saving, setSaving] = useState(false);

  const save = async (patch: Partial<GalleryImage>) => {
    setSaving(true);
    const { error } = await supabase.from("gallery_images").update(patch).eq("id", image.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setDraft({ ...draft, ...patch });
    onChanged();
  };

  const remove = async () => {
    if (!confirm("Delete this image?")) return;
    await supabase.storage.from("revival").remove([image.storage_path]);
    const { error } = await supabase.from("gallery_images").delete().eq("id", image.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    onChanged();
  };

  return (
    <div className="border border-border bg-secondary/30">
      <div className="aspect-square overflow-hidden bg-ink relative">
        <img src={draft.public_url} alt={draft.alt_text ?? ""} className="w-full h-full object-cover" loading="lazy" />
        {!draft.visible && (
          <div className="absolute inset-0 bg-ink/70 flex items-center justify-center">
            <span className="text-[10px] tracking-editorial uppercase text-muted-foreground">Hidden</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <Select value={draft.artist_id ?? "none"} onValueChange={(v) => save({ artist_id: v === "none" ? null : v })}>
          <SelectTrigger className="h-8 rounded-none bg-ink border-border text-xs">
            <SelectValue placeholder="Artist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {artists.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={draft.style} onValueChange={(v) => save({ style: v as GalleryImage["style"] })}>
          <SelectTrigger className="h-8 rounded-none bg-ink border-border text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          value={draft.alt_text ?? ""}
          onChange={(e) => setDraft({ ...draft, alt_text: e.target.value })}
          onBlur={(e) => save({ alt_text: e.target.value })}
          placeholder="Alt text"
          className="h-8 rounded-none bg-ink border-border text-xs"
        />
        <Input
          type="number"
          value={draft.display_order}
          onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
          onBlur={(e) => save({ display_order: Number(e.target.value) })}
          placeholder="Order"
          className="h-8 rounded-none bg-ink border-border text-xs"
        />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Switch checked={draft.visible} onCheckedChange={(v) => save({ visible: v })} disabled={saving} />
            <span className="text-[10px] tracking-editorial uppercase text-muted-foreground">Visible</span>
          </div>
          <Button size="icon" variant="ghost" onClick={remove} className="rounded-none text-destructive h-7 w-7">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}