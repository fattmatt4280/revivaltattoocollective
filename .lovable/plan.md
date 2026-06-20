## Goal
When uploading portfolio images in `/admin/gallery`, open an in-browser crop dialog so every uploaded file is forced to a 4:5 portrait crop before it hits storage.

## UX flow
1. Admin clicks **Upload images** and picks 1+ files (current behavior).
2. Instead of uploading immediately, a modal opens showing the **first file** with a 4:5 crop overlay.
3. Admin drags/resizes the crop box (aspect locked to 4:5) and clicks **Crop & continue**.
4. The cropped file is queued; the modal advances to the next file. Repeat until all done.
5. Once all files are cropped, the existing upload loop runs — uploading the cropped Blobs to the `revival` bucket and inserting `gallery_images` rows. Toast + refresh as today.
6. **Cancel** closes the modal and discards the queue (nothing uploaded).

## Implementation

**Library:** add `react-image-crop` (lightweight, no canvas deps, pairs with a small `<canvas>` to produce the output Blob). Install via `bun add react-image-crop`.

**New component:** `src/components/admin/CropDialog.tsx`
- Props: `files: File[]`, `onComplete: (cropped: File[]) => void`, `onCancel: () => void`.
- Internal state: current index, current `Crop` (aspect locked to 4/5), `HTMLImageElement` ref.
- Uses shadcn `Dialog` for the shell (matches existing admin style).
- Default crop = largest centered 4:5 box for the source dimensions.
- On **Crop & continue**: draw the selected pixel region to an offscreen canvas at the source's native resolution (preserve quality), export via `canvas.toBlob(..., file.type, 0.95)`, wrap in a new `File` keeping the original name, push to results, advance index. On last file → `onComplete(results)`.
- Output sizing: keep native pixels of the crop region (no downscale) so Supabase's existing `?width=600` transform still has full-res source to render thumbs and lightbox cleanly.

**Edit `src/routes/admin.gallery.tsx`:**
- Add `pendingFiles: File[] | null` state.
- Change `onUpload` (file input `onChange`) to just set `pendingFiles` from the FileList instead of uploading directly.
- Render `<CropDialog>` when `pendingFiles` is non-null.
- Move the existing storage upload + DB insert loop into a new `uploadCropped(files: File[])` function, called from `onComplete`. Same session/role guard, same insert payload, same toast/refresh. Same `revival` bucket, same `gallery/<uuid>.<ext>` paths.
- `onCancel` resets `pendingFiles` and clears the file input.

## Out of scope
- Re-cropping images already in the gallery (would need a separate "Edit crop" action; not requested).
- Changing storage layout, RLS, or the public display code — the gallery already renders 4:5 with `object-contain`, so cropped uploads will fill the tile edge-to-edge with no letterbox.
- Server-side validation that the upload is actually 4:5 (client crop is sufficient for an admin-only tool).

## Verification
- Upload a tall portrait, a square, and a landscape image. Confirm the crop modal opens for each, aspect is locked to 4:5, and after cropping the resulting tile on `/` and `/artists/<slug>` fills the 4:5 frame with no letterbox bars.
- Confirm Cancel uploads nothing and leaves the input ready for another pick.
- Confirm existing session/role guard still fires (sign-out → upload → toast).
