## What broke

The recent "security hardening" migration revoked `EXECUTE` on `public.has_role(uuid, app_role)` from `authenticated`. But every admin RLS policy on `artists`, `gallery_images`, `bookings`, `orders`, `site_settings`, and `user_roles` calls `has_role(auth.uid(), 'admin')` inside its `USING` clause. When the policy tries to evaluate that function as the `authenticated` role, Postgres returns:

```
42501: permission denied for function has_role
```

The browser network log on `/rest/v1/user_roles?...role=eq.admin` shows exactly this 403. So:

- The auth layer thinks you're signed in (you are).
- Every admin check silently fails → you appear as a non-admin.
- Bios, photos, Brady's last name, etc. aren't deleted — they're just invisible because the `SELECT` policies that admins rely on can't run. Same reason your edits "reverted": admin `UPDATE`s have been failing for a while.

## Fix

One small migration that restores execute rights on the three security-definer functions to the roles that legitimately need to call them through RLS / triggers:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
-- handle_new_user runs as an auth trigger, owned/executed by the trigger context;
-- update_updated_at_column runs as a row trigger. Restore default execute to be safe:
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role;
```

`has_role` is `SECURITY DEFINER` with a locked `search_path` — granting EXECUTE on it is the standard, correct pattern (this is the exact shape recommended in the user-roles guide). Revoking it was the mistake.

## Verification steps after applying

1. Query `public.artists` and `public.gallery_images` directly with service role to confirm the prior edits, bios, and uploaded images are still present in the DB (they should be — nothing was deleted).
2. Reload `/admin` — admin gate should pass, bios + photos should reappear.
3. Update `@security-memory` to record: do NOT revoke EXECUTE on `has_role` from `authenticated`; RLS depends on it.

## Out of scope

No app code changes. No data restores needed (data wasn't lost). Just the GRANT migration + memory update.
