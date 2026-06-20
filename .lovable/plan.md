## Plan: stop portfolio/home images from cropping at the source

The screenshots show the `<img>` elements are using `object-contain`, but the image files requested by the site are still the backend-rendered optimized URLs with only `width=...`. Those rendered versions can be transformed/cropped before the browser ever receives them, so `object-contain` cannot restore the missing side edges.

### What I’ll change

1. **Use original uploaded image URLs for display tiles**
   - Update homepage artist tiles in `src/components/site/Artists.tsx` to use each image’s original `public_url` instead of the optimized render URL.
   - This matches the admin preview behavior more closely, since the admin card displays `draft.public_url` directly.

2. **Use original uploaded image URLs inside artist portfolios**
   - Update `src/routes/artists.$slug.tsx` so the portfolio grid and lightbox use `public_url` directly.
   - Keep `object-contain` so images letterbox instead of cropping.

3. **Use original image URLs in the gallery section too**
   - Update `src/components/site/Gallery.tsx` for consistency, including its lightbox.

4. **Keep the existing square tile layout**
   - Do not change ordering, uploads, admin flow, database records, or navigation.
   - Only change the frontend image source/sizing behavior so no edges are cut off.

### Verification

After implementation, I’ll check the homepage and `/artists/matt` preview to confirm the tattoo images show full edges with letterboxing rather than side cropping.