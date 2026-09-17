import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { teamFromRow } from '@/lib/mappers/teams';

export default async function TeamsListPage() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const [{ data: teamRows }, { data: memberRows }] = await Promise.all([
    supabase.from('teams').select('*').eq('manager_id', currentUser!.id).order('created_at', { ascending: true }),
    supabase.from('profiles').select('id, team_id').eq('role', 'member'),
  ]);

  const teams = (teamRows ?? []).map(teamFromRow);
  const memberCountByTeam = new Map<string, number>();
  for (const m of memberRows ?? []) {
    if (!m.team_id) continue;
    memberCountByTeam.set(m.team_id, (memberCountByTeam.get(m.team_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
        <Button render={<Link href="/teams/new" />} nativeButton={false} size="sm">
          <Plus className="size-4" /> New team
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
          <Users className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">You haven&apos;t created any teams yet.</p>
          <Button render={<Link href="/teams/new" />} nativeButton={false} size="sm">
            Create a team
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const memberCount = memberCountByTeam.get(team.id) ?? 0;
            return (
              <li key={team.id}>
                <Link
                  href={`/teams/${team.id}`}
                  className="flex h-full flex-col gap-1 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50"
                >
                  <span className="font-medium text-foreground">{team.name}</span>
                  {team.description && <span className="text-sm text-muted-foreground">{team.description}</span>}
                  <span className="mt-2 text-xs text-muted-foreground">
                    {memberCount} member{memberCount === 1 ? '' : 's'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
