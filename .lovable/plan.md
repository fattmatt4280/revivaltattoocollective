Plan: Fix photo zoom / inconsistent tile sizes across public gallery and portfolio pages

## Goal
Replace masonry and variable-height tile layouts with a uniform grid where every tile is exactly portrait 4:5, and every photo is shown fully (object-contain) — no cropping, no zoom, letterboxing inside the tile when the source aspect differs.

## Files to change
1. `src/components/site/Gallery.tsx` — artist thumb grids on homepage
2. `src/routes/artists.$slug.tsx` — full portfolio grid on artist detail page
3. `src/components/site/Artists.tsx` — artist thumb grids if present (verify during implementation)

## Changes
- Remove `columns-*` / masonry CSS layout
- Use a standard CSS grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4`
- Wrap each image in a container with `aspect-[4/5] overflow-hidden bg-ink/60`
- Set `<img>` to `w-full h-full object-contain` so the full image is visible inside the tile
- Preserve existing hover overlays, lightbox triggers, and keyboard navigation
- Keep responsive gaps and ensure no layout shift on load

## Out of scope
- Admin gallery management UI
- Image upload or cropping behavior
- Changing the stored source images

## Verification
- Load homepage Gallery section and an artist portfolio page
- Confirm all tiles are the same size, no zoom/crop, and full image is visible
- Confirm hover states and lightbox still work correctly