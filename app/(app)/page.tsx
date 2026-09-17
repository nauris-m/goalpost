import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { teamFromRow } from '@/lib/mappers/teams';
import { memberFromRow } from '@/lib/mappers/members';
import { periodFromRow } from '@/lib/mappers/periods';
import { goalFromRow } from '@/lib/mappers/goals';
import { objectiveFromRow } from '@/lib/mappers/objectives';
import { keyResultFromRow } from '@/lib/mappers/key-results';
import { OverviewClient } from './overview-client';

export default async function OverviewPage() {
  const supabase = await createClient();

  const [currentUser, { data: teamRows }, { data: memberRows }, { data: periodRows }, { data: goalRows }, { data: objectiveRows }, { data: keyResultRows }] =
    await Promise.all([
      getCurrentUser(),
      supabase.from('teams').select('*'),
      supabase.from('profiles').select('*').eq('role', 'member'),
      supabase.from('periods').select('*'),
      supabase.from('goals').select('*'),
      supabase.from('objectives').select('*'),
      supabase.from('key_results').select('*'),
    ]);

  if (currentUser!.role !== 'manager') redirect('/my-goals');

  return (
    <OverviewClient
      currentUser={currentUser!}
      initialTeams={(teamRows ?? []).map(teamFromRow)}
      initialMembers={(memberRows ?? []).map(memberFromRow)}
      initialPeriods={(periodRows ?? []).map(periodFromRow)}
      initialGoals={(goalRows ?? []).map(goalFromRow)}
      initialObjectives={(objectiveRows ?? []).map(objectiveFromRow)}
      initialKeyResults={(keyResultRows ?? []).map(keyResultFromRow)}
    />
  );
}
