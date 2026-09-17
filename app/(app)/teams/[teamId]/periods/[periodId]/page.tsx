import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { teamFromRow } from '@/lib/mappers/teams';
import { periodFromRow } from '@/lib/mappers/periods';

export default async function PeriodGoalsPage({ params }: { params: Promise<{ teamId: string; periodId: string }> }) {
  const { teamId, periodId } = await params;
  const supabase = await createClient();
  const [{ data: teamRow }, { data: periodRow }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', teamId).maybeSingle(),
    supabase.from('periods').select('*').eq('id', periodId).eq('team_id', teamId).maybeSingle(),
  ]);

  if (!teamRow || !periodRow) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
        <h1 className="text-xl font-semibold text-foreground">Period not found</h1>
        <p className="text-sm text-muted-foreground">
          {teamRow ? "This period doesn't exist for this team." : "This team doesn't exist, or you don't have access to it."}
        </p>
        <Link href={teamRow ? `/teams/${teamId}` : '/teams'} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ChevronLeft className="size-4" /> {teamRow ? 'Back to team' : 'Back to Teams'}
        </Link>
      </div>
    );
  }

  const team = teamFromRow(teamRow);
  const period = periodFromRow(periodRow);

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/teams/${team.id}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-3.5" /> {team.name}
      </Link>
      <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
        <h1 className="text-xl font-semibold text-foreground">{period.name}</h1>
        <p className="text-sm text-muted-foreground">
          {period.startDate} – {period.endDate}
        </p>
        <p className="text-sm text-muted-foreground">
          Goals and OKRs for this period are coming in a later milestone - this page just confirms the period itself is
          real and reachable.
        </p>
      </div>
    </div>
  );
}
