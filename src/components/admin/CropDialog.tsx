import { useEffect, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ASPECT = 4 / 5;

type Props = {
  files: File[];
  onComplete: (cropped: File[]) => void;
  onCancel: () => void;
};

function defaultCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, ASPECT, width, height),
    width,
    height,
  );
}

async function cropToFile(
  img: HTMLImageElement,
  pixelCrop: PixelCrop,
  source: File,
): Promise<File> {
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;
  const sx = pixelCrop.x * scaleX;
  const sy = pixelCrop.y * scaleY;
  const sw = pixelCrop.width * scaleX;
  const sh = pixelCrop.height * scaleY;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const type = source.type && source.type.startsWith("image/") ? source.type : "image/jpeg";
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
      0.95,
    ),
  );
  return new File([blob], source.name, { type, lastModified: Date.now() });
}

export function CropDialog({ files, onComplete, onCancel }: Props) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<File[]>([]);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const current = files[index];

  useEffect(() => {
    if (!current) return;
    const url = URL.createObjectURL(current);
    setSrc(url);
    setCrop(undefined);
    setPixelCrop(null);
    return () => URL.revokeObjectURL(url);
  }, [current]);

  if (!current) return null;

  const handleNext = async () => {
    if (!imgRef.current || !pixelCrop || pixelCrop.width < 2 || pixelCrop.height < 2) return;
    setBusy(true);
    try {
      const out = await cropToFile(imgRef.current, pixelCrop, current);
      const nextResults = [...results, out];
      if (index + 1 >= files.length) {
        onComplete(nextResults);
      } else {
        setResults(nextResults);
        setIndex(index + 1);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-3xl bg-ink border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-bone text-xl">
            Crop to 4:5 — {index + 1} of {files.length}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-secondary/30 p-2">
          {src && (
            <ReactCrop
              crop={crop}
              aspect={ASPECT}
              onChange={(_, percent) => setCrop(percent)}
              onComplete={(c) => setPixelCrop(c)}
              keepSelection
            >
              <img
                ref={imgRef}
                src={src}
                alt={current.name}
                onLoad={(e) => {
                  const t = e.currentTarget;
                  const initial = defaultCrop(t.width, t.height);
                  setCrop(initial);
                  // Seed pixelCrop so user can click straight through.
                  const pxW = (initial.width / 100) * t.width;
                  const pxH = (initial.height / 100) * t.height;
                  const pxX = ((initial.x ?? 0) / 100) * t.width;
                  const pxY = ((initial.y ?? 0) / 100) * t.height;
                  setPixelCrop({ unit: "px", x: pxX, y: pxY, width: pxW, height: pxH });
                }}
                style={{ maxHeight: "60vh", display: "block" }}
              />
            </ReactCrop>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground truncate max-w-[50%]">{current.name}</p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel} disabled={busy} className="rounded-none tracking-editorial uppercase text-[11px]">
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={busy || !pixelCrop} className="rounded-none bg-bone text-ink hover:bg-primary hover:text-primary-foreground tracking-editorial uppercase text-[11px]">
              {index + 1 === files.length ? (busy ? "Processing…" : "Crop & upload") : "Crop & continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}