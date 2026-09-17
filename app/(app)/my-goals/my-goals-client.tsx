'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ApexRadialChart } from '@/components/charts/apex-radial-chart';
import { ApexBarChart } from '@/components/charts/apex-bar-chart';
import { GoalProgress } from '@/components/shared/goal-progress';
import { useTeamsQuery } from '@/lib/queries/use-teams';
import { useMembersQuery } from '@/lib/queries/use-members';
import { usePeriodsQuery } from '@/lib/queries/use-periods';
import { useGoalsQuery, useToggleGoalMilestoneMutation, useUpdateGoalProgressMutation } from '@/lib/queries/use-goals';
import { useLogActivity } from '@/lib/queries/use-notifications';
import { deriveGoalStatus, goalCompletion, GOAL_STATUS_BADGE_CLASSES, GOAL_STATUS_LABELS } from '@/lib/domain/goals-util';
import { memberCompletion } from '@/lib/domain/goals-util';
import type { AuthUser, Goal, Member, Period, Team } from '@/lib/types/domain';

export function MyGoalsClient({
  currentUser,
  initialTeams,
  initialMembers,
  initialPeriods,
  initialGoals,
}: {
  currentUser: AuthUser;
  initialTeams: Team[];
  initialMembers: Member[];
  initialPeriods: Period[];
  initialGoals: Goal[];
}) {
  useTeamsQuery(initialTeams);
  const { data: members } = useMembersQuery(initialMembers);
  const { data: periods } = usePeriodsQuery(initialPeriods);
  const { data: goals } = useGoalsQuery(initialGoals);
  const updateProgress = useUpdateGoalProgressMutation();
  const toggleMilestone = useToggleGoalMilestoneMutation();
  const logActivity = useLogActivity();

  const searchParams = useSearchParams();
  const queryMemberId = searchParams.get('memberId') ?? '';
  const [explicitMemberId, setExplicitMemberId] = useState<string | null>(null);

  const isManager = currentUser.role === 'manager';

  const selectedMemberId = isManager ? explicitMemberId || queryMemberId || members[0]?.id || '' : currentUser.id;
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const memberPeriods = useMemo(
    () =>
      selectedMember
        ? [...periods].filter((p) => p.teamId === selectedMember.teamId).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
        : [],
    [periods, selectedMember],
  );

  // Deliberately not memoized - deriving "current period" from the wall clock is inherently
  // time-dependent, so it's recomputed each render rather than cached against a stale value.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const currentPeriod = memberPeriods.find((p) => Date.parse(p.startDate) <= now && now <= Date.parse(p.endDate)) ?? memberPeriods.at(-1);

  const currentPeriodCompletion = currentPeriod ? memberCompletion(goals, selectedMemberId, currentPeriod.id) : 0;

  const periodTrend = memberPeriods.map((period) => ({ period, completion: memberCompletion(goals, selectedMemberId, period.id) }));
  const trendValues = periodTrend.map((row) => row.completion);
  const trendLabels = periodTrend.map((row) => row.period.name);

  const currentGoalRows = currentPeriod
    ? goals
        .filter((g) => g.ownerId === selectedMemberId && g.periodId === currentPeriod.id)
        .map((goal) => ({ goal, completion: goalCompletion(goal), status: deriveGoalStatus(goal, currentPeriod) }))
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Goals</h1>
        {isManager && members.length > 0 && (
          <select
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
            value={selectedMemberId}
            onChange={(e) => setExplicitMemberId(e.target.value)}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedMember ? (
        <p className="text-sm text-muted-foreground">No member selected.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="size-20">
                <ApexRadialChart value={currentPeriodCompletion} color="primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{currentPeriod?.name ?? 'No period'}</p>
                <p className="text-xs text-muted-foreground">Current period completion</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-2 text-sm font-medium text-foreground">Trend across periods</p>
              <div style={{ height: Math.max(trendValues.length * 36 + 20, 80) }}>
                {trendValues.length > 0 ? (
                  <ApexBarChart values={trendValues} labels={trendLabels} color="info" />
                ) : (
                  <p className="text-sm text-muted-foreground">No periods yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">Goals for {currentPeriod?.name ?? 'this period'}</h2>
            </div>
            {currentGoalRows.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">No goals in this period.</p>
            ) : (
              <ul className="divide-y divide-border">
                {currentGoalRows.map(({ goal, completion, status }) => (
                  <li key={goal.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{goal.title}</span>
                        <Badge className={GOAL_STATUS_BADGE_CLASSES[status]} variant="secondary">
                          {GOAL_STATUS_LABELS[status]}
                        </Badge>
                      </div>
                      {goal.description && <p className="mt-0.5 text-xs text-muted-foreground">{goal.description}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">{completion}% complete</p>
                    </div>
                    <GoalProgress
                      goal={goal}
                      onNumericChange={(value) =>
                        updateProgress.mutate(
                          { goalId: goal.id, currentValue: value },
                          {
                            onSuccess: () =>
                              logActivity({
                                actorId: currentUser.id,
                                actorName: currentUser.name,
                                verb: 'goal.progress_updated',
                                summary: `updated progress on "${goal.title}".`,
                                targetTeamId: currentPeriod?.teamId ?? null,
                              }),
                            onError: () => toast.error('Failed to update progress.'),
                          },
                        )
                      }
                      onBooleanChange={(checked) =>
                        updateProgress.mutate(
                          { goalId: goal.id, currentValue: checked ? 1 : 0 },
                          {
                            onSuccess: () =>
                              logActivity({
                                actorId: currentUser.id,
                                actorName: currentUser.name,
                                verb: 'goal.progress_updated',
                                summary: `updated progress on "${goal.title}".`,
                                targetTeamId: currentPeriod?.teamId ?? null,
                              }),
                            onError: () => toast.error('Failed to update progress.'),
                          },
                        )
                      }
                      onMilestoneToggle={(milestoneId) =>
                        toggleMilestone.mutate(
                          { goal, milestoneId },
                          {
                            onSuccess: () =>
                              logActivity({
                                actorId: currentUser.id,
                                actorName: currentUser.name,
                                verb: 'goal.milestone_toggled',
                                summary: `updated a milestone on "${goal.title}".`,
                                targetTeamId: currentPeriod?.teamId ?? null,
                              }),
                            onError: () => toast.error('Failed to update milestone.'),
                          },
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
