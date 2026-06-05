## Plan

1. **Confirm the actual failure path**
   - The screenshot error is the generic RLS write denial.
   - The captured requests show the gallery page is reading with the public/anonymous token, so writes can fail even if the admin UI is visible.

2. **Harden the admin auth state**
   - Update the admin auth/provider flow so if the session disappears or expires, `isAdmin` is immediately cleared and the admin route sends the user back to login instead of leaving the admin page open.
   - Prefer a fresh `getUser()` check for admin-only actions instead of trusting stale in-memory state.

3. **Guard gallery writes before upload**
   - In the gallery admin upload handler, check for a valid signed-in admin session before touching storage or inserting `gallery_images`.
   - If the session is missing/expired, show a clear “Please sign in again” message instead of the raw RLS error.

4. **Improve cleanup and error messaging**
   - If storage upload succeeds but the gallery row insert fails, remove the uploaded file so there are no orphaned images.
   - Show whether the failure happened during image upload or gallery record creation.

## Technical details

- Files to change: `src/lib/auth.tsx`, `src/routes/admin.gallery.tsx`, and possibly the admin route guard in `src/routes/admin.tsx`.
- No database policy change is planned because the existing policies correctly require the `admin` role; the issue appears to be that the browser request is not carrying the logged-in admin session at write time.