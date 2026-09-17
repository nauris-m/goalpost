import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { teamFromRow } from '@/lib/mappers/teams';
import { memberFromRow } from '@/lib/mappers/members';
import { periodFromRow } from '@/lib/mappers/periods';
import { goalFromRow } from '@/lib/mappers/goals';
import { MyGoalsClient } from './my-goals-client';

export const metadata: Metadata = { title: 'My Goals' };

export default async function MyGoalsPage() {
  const supabase = await createClient();

  const [currentUser, { data: teamRows }, { data: memberRows }, { data: periodRows }, { data: goalRows }] = await Promise.all([
    getCurrentUser(),
    supabase.from('teams').select('*'),
    supabase.from('profiles').select('*').eq('role', 'member'),
    supabase.from('periods').select('*'),
    supabase.from('goals').select('*'),
  ]);

  return (
    <MyGoalsClient
      currentUser={currentUser!}
      initialTeams={(teamRows ?? []).map(teamFromRow)}
      initialMembers={(memberRows ?? []).map(memberFromRow)}
      initialPeriods={(periodRows ?? []).map(periodFromRow)}
      initialGoals={(goalRows ?? []).map(goalFromRow)}
    />
  );
}
