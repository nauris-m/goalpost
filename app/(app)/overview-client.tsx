'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTeamsQuery } from '@/lib/queries/use-teams';
import { useMembersQuery } from '@/lib/queries/use-members';
import { usePeriodsQuery } from '@/lib/queries/use-periods';
import { useGoalsQuery } from '@/lib/queries/use-goals';
import { useObjectivesQuery } from '@/lib/queries/use-objectives';
import { useKeyResultsQuery } from '@/lib/queries/use-key-results';
import { deriveGoalStatus, goalCompletion, memberCompletion, objectiveCompletion, teamCompletion } from '@/lib/domain/goals-util';
import { TeamCompletionCard } from '@/components/dashboard/team-completion-card';
import { TeamObjectivesCard } from '@/components/dashboard/team-objectives-card';
import { GoalsStatusBreakdownCard } from '@/components/dashboard/goals-status-breakdown-card';
import { CompletionByMemberCard } from '@/components/dashboard/completion-by-member-card';
import { MemberRosterCard } from '@/components/dashboard/member-roster-card';
import { GoalsAtRiskCard } from '@/components/dashboard/goals-at-risk-card';
import { Button } from '@/components/ui/button';
import type { AuthUser, Goal, GoalStatus, KeyResult, Member, Objective, Period, Team } from '@/lib/types/domain';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function OverviewClient({
  currentUser,
  initialTeams,
  initialMembers,
  initialPeriods,
  initialGoals,
  initialObjectives,
  initialKeyResults,
}: {
  currentUser: AuthUser;
  initialTeams: Team[];
  initialMembers: Member[];
  initialPeriods: Period[];
  initialGoals: Goal[];
  initialObjectives: Objective[];
  initialKeyResults: KeyResult[];
}) {
  const { data: teams } = useTeamsQuery(initialTeams);
  const { data: members } = useMembersQuery(initialMembers);
  const { data: periods } = usePeriodsQuery(initialPeriods);
  const { data: goals } = useGoalsQuery(initialGoals);
  const { data: objectives } = useObjectivesQuery(initialObjectives);
  const { data: keyResults } = useKeyResultsQuery(initialKeyResults);

  const [explicitTeamId, setExplicitTeamId] = useState<string | null>(null);
  const [explicitPeriodId, setExplicitPeriodId] = useState<string | null>(null);

  const selectedTeamId = explicitTeamId || teams[0]?.id || '';
  const team = teams.find((t) => t.id === selectedTeamId);

  const teamPeriods = [...periods].filter((p) => p.teamId === selectedTeamId).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));

  // Deliberately not memoized - deriving "current period" from the wall clock is inherently
  // time-dependent, so it's recomputed each render rather than cached against a stale value.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const defaultPeriod = teamPeriods.find((p) => Date.parse(p.startDate) <= now && now <= Date.parse(p.endDate)) ?? teamPeriods.at(-1);
  const period = teamPeriods.find((p) => p.id === explicitPeriodId) ?? defaultPeriod;

  function selectTeam(teamId: string) {
    setExplicitTeamId(teamId);
    setExplicitPeriodId(null);
  }

  const header = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting()}, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground">{team ? `Here's where ${team.name} stands this period.` : 'Create a team to get started.'}</p>
      </div>
      {teams.length > 0 && (
        <div className="flex gap-2">
          <select className="h-9 rounded-md border bg-transparent px-3 text-sm" value={selectedTeamId} onChange={(e) => selectTeam(e.target.value)}>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {teamPeriods.length > 0 && period && (
            <select
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
              value={period.id}
              onChange={(e) => setExplicitPeriodId(e.target.value)}
            >
              {teamPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );

  if (!team) {
    return (
      <div className="flex flex-col gap-5">
        {header}
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
          <h2 className="text-lg font-semibold text-foreground">No teams yet</h2>
          <p className="text-sm text-muted-foreground">Create a team to start tracking goals.</p>
          <Button render={<Link href="/onboarding" />} nativeButton={false}>
            Create a team
          </Button>
        </div>
      </div>
    );
  }

  if (!period) {
    return (
      <div className="flex flex-col gap-5">
        {header}
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-8">
          <h2 className="text-lg font-semibold text-foreground">{team.name} has no periods yet</h2>
          <p className="text-sm text-muted-foreground">Add a period to start tracking goals for this team.</p>
          <Button render={<Link href={`/teams/${team.id}`} />} nativeButton={false}>
            Go to team
          </Button>
        </div>
      </div>
    );
  }

  const teamMembers = members.filter((m) => m.teamId === team.id);
  const goalsOfPeriod = goals.filter((g) => g.periodId === period.id);
  const objectivesForPeriod = objectives.filter((o) => o.periodId === period.id);

  const teamCompletionPercent = teamCompletion(goals, period.id);
  const completedGoalsCount = goalsOfPeriod.filter((g) => goalCompletion(g) >= 100).length;

  const objectivesCompletionPercent =
    objectivesForPeriod.length === 0
      ? 0
      : Math.round(
          objectivesForPeriod.reduce((sum, o) => sum + objectiveCompletion(keyResults, o.id), 0) / objectivesForPeriod.length,
        );

  const memberRows = teamMembers
    .map((member) => ({
      member,
      completion: memberCompletion(goals, member.id, period.id),
      goalCount: goalsOfPeriod.filter((g) => g.ownerId === member.id).length,
    }))
    .sort((a, b) => b.completion - a.completion);

  const statusBreakdown: Record<GoalStatus, number> = { 'not-started': 0, 'in-progress': 0, 'at-risk': 0, completed: 0 };
  for (const goal of goalsOfPeriod) statusBreakdown[deriveGoalStatus(goal, period)]++;

  const atRiskGoals = goalsOfPeriod
    .map((goal) => ({ goal, member: members.find((m) => m.id === goal.ownerId), completion: goalCompletion(goal), status: deriveGoalStatus(goal, period) }))
    .filter((row) => row.status === 'at-risk')
    .sort((a, b) => a.completion - b.completion);

  return (
    <div className="flex flex-col gap-5">
      {header}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TeamCompletionCard percent={teamCompletionPercent} goalsCompleted={completedGoalsCount} goalsTotal={goalsOfPeriod.length} />
        <TeamObjectivesCard percent={objectivesCompletionPercent} objectiveCount={objectivesForPeriod.length} teamId={team.id} periodId={period.id} />
        <GoalsStatusBreakdownCard counts={statusBreakdown} />
      </div>

      <CompletionByMemberCard rows={memberRows} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MemberRosterCard rows={memberRows} />
        </div>
        <div className="lg:col-span-5">
          <GoalsAtRiskCard rows={atRiskGoals} />
        </div>
      </div>
    </div>
  );
}
