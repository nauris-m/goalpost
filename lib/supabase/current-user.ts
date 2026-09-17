import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { authUserFromProfileRow } from '@/lib/mappers/profiles';
import type { AuthUser } from '@/lib/types/domain';

/**
 * Request-memoized - layout.tsx and a page.tsx both calling this only pays for one round-trip.
 * Resolves via the `current_profile()` RPC (a single hop to Postgres, which reads `auth.uid()`
 * off the JWT already attached to the request) instead of `auth.getUser()` + a separate select -
 * `auth.getUser()` calls out to Supabase's Auth service, a second backend entirely; skipping it
 * here is safe because middleware already performed that real verification and redirects
 * unauthenticated requests before any page component runs. Returns null when there's no session
 * or no profile yet - only layout.tsx needs to check that (it's the auth boundary); every page
 * under it can trust middleware already gated access, so they can use the non-null assertion
 * convention already used throughout this codebase (e.g. `profileRow!`).
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();
  const { data: profileRow } = await supabase.rpc('current_profile');
  if (!profileRow) return null;
  return authUserFromProfileRow(profileRow);
});
