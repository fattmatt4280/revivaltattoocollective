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
import { CropDialog } from "@/components/admin/CropDialog";

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
  head: () => ({ meta: [{ title: "Gallery — Revival Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: GalleryAdmin,
});

function GalleryAdmin() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [filterArtist, setFilterArtist] = useState<string>("all");
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);

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

  const renumberByDate = async () => {
    if (!images || images.length === 0) return;
    let q = supabase.from("gallery_images").select("id").order("created_at", { ascending: false });
    if (filterArtist !== "all") q = q.eq("artist_id", filterArtist);
    const { data, error } = await q;
    if (error) return toast.error(error.message);
    const updates = (data ?? []).map((row, i) =>
      supabase.from("gallery_images").update({ display_order: i + 1 }).eq("id", row.id)
    );
    await Promise.all(updates);
    toast.success(`Renumbered ${updates.length} images`);
    refresh();
  };

  const resetInput = () => {
    if (fileRef.current) fileRef.current.value = "";
  };

  const onPick = (files: FileList) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) {
      resetInput();
      return;
    }
    setPendingFiles(arr);
  };

  const uploadCropped = async (files: File[]) => {
    setUploading(true);
    try {
      // Verify a live admin session BEFORE touching storage so we surface
      // a clear "sign in again" message instead of a raw RLS denial.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Your session expired. Please sign in again.");
        return;
      }
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        toast.error("Your session expired. Please sign in again.");
        return;
      }
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) {
        toast.error("You no longer have admin access. Please sign in again.");
        return;
      }

      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `gallery/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("revival").upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
        });
        if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);
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
        if (insErr) {
          // Clean up the orphaned storage object so the bucket stays tidy.
          await supabase.storage.from("revival").remove([path]);
          throw new Error(`Saving image record failed: ${insErr.message}`);
        }
      }
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      resetInput();
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

        <div className="ml-auto flex items-center gap-3">
          <Button
            onClick={renumberByDate}
            variant="outline"
            className="rounded-none border-border tracking-editorial uppercase text-[11px] text-muted-foreground hover:text-bone"
          >
            Renumber by date
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && onPick(e.target.files)}
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

      {pendingFiles && (
        <CropDialog
          files={pendingFiles}
          onCancel={() => {
            setPendingFiles(null);
            resetInput();
          }}
          onComplete={async (cropped) => {
            setPendingFiles(null);
            await uploadCropped(cropped);
          }}
        />
      )}

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