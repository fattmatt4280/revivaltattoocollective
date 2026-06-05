## Goal
Add Facebook and TikTok links alongside Instagram, both per-artist and in the site footer.

## Changes

### 1. Per-artist handles (admin + display)
The `artists.instagram_handles` JSONB column already stores `{handle, url}` objects. Generalize it to support multiple platforms by adding a `platform` field (`instagram` | `facebook` | `tiktok`), keeping the column name for backward compatibility.

- **Migration**: backfill existing rows so each handle gets `platform: "instagram"`. No schema change needed (JSONB is flexible).
- **`src/routes/admin.artists.tsx`**: in the "Instagram Handles" editor, rename label to "Social Handles" and add a platform dropdown (Instagram / Facebook / TikTok) per row. New rows default to Instagram.
- **`src/components/site/Artists.tsx`**: render the correct icon per platform (`Instagram`, `Facebook`, lucide `Music2` or a custom TikTok SVG since lucide lacks TikTok). Update the `Artist` type's `handles` to include `platform`.

### 2. Studio links in footer
- **`src/components/site/Footer.tsx`**: under "Follow", add Facebook and TikTok entries next to the existing Instagram handles. Since you didn't provide studio URLs, I'll use `#` placeholders with a TODO comment so you can drop in the real URLs (or tell me and I'll wire them up).

## Technical notes
- TikTok icon: lucide-react has no TikTok glyph. I'll add a tiny inline SVG component (`src/components/icons/TikTokIcon.tsx`) using the official TikTok mark, sized to match the 3.5×3.5 Instagram icon.
- Existing artist data keeps working — display code treats missing `platform` as `"instagram"`.
- No backend/RLS changes; JSONB shape evolves in place.

## Open question
What are the studio's Facebook page URL and TikTok profile URL? I'll wire placeholders for now unless you paste them.
