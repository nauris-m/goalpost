import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { memberFromRow } from '@/lib/mappers/members';
import { teamFromRow } from '@/lib/mappers/teams';
import { MembersClient } from './members-client';

export const metadata: Metadata = { title: 'Members' };

export default async function MembersPage() {
  const supabase = await createClient();

  const [currentUser, { data: memberRows }, { data: teamRows }] = await Promise.all([
    getCurrentUser(),
    supabase.from('profiles').select('*').eq('role', 'member'),
    supabase.from('teams').select('*'),
  ]);

  return (
    <MembersClient
      currentUser={currentUser!}
      initialMembers={(memberRows ?? []).map(memberFromRow)}
      initialTeams={(teamRows ?? []).map(teamFromRow)}
    />
  );
}
