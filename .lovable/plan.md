## Goal

Stop cropping portfolio images anywhere on the public site. Every tile uses `object-fit: contain` inside a fixed square frame, with the bare background showing as letterbox/pillarbox bars — matching the admin gallery's tile shape (`aspect-square`).

## Changes

1. **`src/components/site/Artists.tsx`** — home artist strips
   - Keep the figure square (`paddingBottom: "100%"`).
   - Change `objectFit: "cover"` → `objectFit: "contain"` on the `<img>`.
   - Keep the dark `#0a0a0a` background so unused space reads as intentional letterbox.

2. **`src/components/site/Gallery.tsx`** — home gallery tiles
   - Keep `aspect-square`.
   - Image stays `object-contain` (already is); no change needed beyond confirming.

3. **`src/routes/artists.$slug.tsx`** — artist portfolio grid
   - Keep `aspect-square` on skeleton and tile containers.
   - Image stays `object-contain` (already is); no change needed beyond confirming.
   - Lightbox stays `object-contain`.

Net effective change: only `Artists.tsx` flips from `cover` to `contain`. The other two files already use `object-contain` — the reported "edges cut off" on portfolio pages is actually letterbox bars from 4:5 images in square frames, which is the behavior the user is now explicitly asking for (contain + padding). Confirming no code change is needed there is part of the plan so we don't introduce regressions.

## Out of scope

- Changing tile aspect ratio (staying square to match admin).
- Re-cropping or re-uploading existing images.
- Upload/crop flow, storage, RLS, lightbox behavior.

## Verification

Reload `/` and `/artists/brady`, `/artists/fattmatt`. Confirm:
- Home artist strips show full images with thin dark bars on top/bottom for portrait shots (no zoom-in).
- Portfolio grid tiles show full images, same letterbox treatment.
- Admin gallery is unchanged.
