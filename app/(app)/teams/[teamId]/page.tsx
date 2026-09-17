import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { memberFromRow } from '@/lib/mappers/members';
import { teamFromRow } from '@/lib/mappers/teams';
import { TeamDetailClient } from './team-detail-client';

export const metadata: Metadata = { title: 'Team' };

export default async function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const supabase = await createClient();

  const [currentUser, { data: teamRow }, { data: memberRows }, { data: allTeamRows }] = await Promise.all([
    getCurrentUser(),
    supabase.from('teams').select('*').eq('id', teamId).maybeSingle(),
    supabase.from('profiles').select('*').eq('role', 'member'),
    supabase.from('teams').select('*'),
  ]);

  if (!teamRow) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
        <h1 className="text-xl font-semibold text-foreground">Team not found</h1>
        <p className="text-sm text-muted-foreground">This team doesn&apos;t exist, or you don&apos;t have access to it.</p>
        <Link href="/teams" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ChevronLeft className="size-4" /> Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <TeamDetailClient
      currentUser={currentUser!}
      initialTeam={teamFromRow(teamRow)}
      initialMembers={(memberRows ?? []).map(memberFromRow)}
      initialTeams={(allTeamRows ?? []).map(teamFromRow)}
    />
  );
}
