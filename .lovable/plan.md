Plan: Make sure no stored image is actually cropped and bust stale caches

## What's already true
- Admin upload (`src/routes/admin.gallery.tsx`) stores the raw file with no canvas crop or resize.
- Display URL only passes `?width=600&quality=80` (no `&height=`, no `&resize=cover`), so Supabase's image transform scales proportionally — it cannot crop.
- Public tiles now use `aspect-[4/5]` + `object-contain`, so the full image is always shown (letterboxed if the source is wider/squarer than 4:5).

## Likely cause of "still cropped" images
1. Browser cache is serving the previous transformed thumbnail.
2. The source file itself was cropped before it was uploaded (e.g. a square Instagram export). Those will letterbox, which can read as "still off" even though nothing is being cropped now.

## Changes
1. Cache bust the thumbnail URLs in `src/components/site/Gallery.tsx`, `src/components/site/Artists.tsx`, and `src/routes/artists.$slug.tsx` by appending the image's `updated_at` (or `id`) as a query param to `optimizeUrl(...)`. This forces fresh fetches without touching storage.
2. Select `updated_at` in the three existing gallery queries so the cache-buster has a stable value.

## Out of scope
- Re-uploading or re-cropping any source files (not needed — originals are intact).
- Changing the 4:5 tile shape.

## Verification
- Hard reload `/` and `/artists/<slug>`; confirm every tile shows the full uploaded image, with bars instead of cropping when the source aspect differs from 4:5.
- If any specific image still appears cropped after cache-bust, that one was cropped before upload — flag it to the user so they can re-upload only that file.