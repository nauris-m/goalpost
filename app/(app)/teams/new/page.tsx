import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { memberFromRow } from '@/lib/mappers/members';
import { teamFromRow } from '@/lib/mappers/teams';
import { TeamSetupClient } from './team-setup-client';

export default async function NewTeamPage() {
  const supabase = await createClient();

  const [currentUser, { data: memberRows }, { data: teamRows }] = await Promise.all([
    getCurrentUser(),
    supabase.from('profiles').select('*').eq('role', 'member'),
    supabase.from('teams').select('*'),
  ]);

  return (
    <TeamSetupClient
      currentUser={currentUser!}
      initialMembers={(memberRows ?? []).map(memberFromRow)}
      initialTeams={(teamRows ?? []).map(teamFromRow)}
    />
  );
}
