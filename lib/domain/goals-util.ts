import { Goal, GoalStatus, KeyResult, Period, TrackedMetric } from '@/lib/types/domain';

const AT_RISK_PACE_BUFFER = 15;

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  'at-risk': 'At risk',
  completed: 'Completed',
};

/** Full Tailwind class strings (not fragments) so the classes survive Tailwind's static source scan. */
export const GOAL_STATUS_BADGE_CLASSES: Record<GoalStatus, string> = {
  'not-started': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/15 text-info',
  'at-risk': 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
};

export const GOAL_STATUS_DOT_CLASSES: Record<GoalStatus, string> = {
  'not-started': 'bg-muted-foreground',
  'in-progress': 'bg-info',
  'at-risk': 'bg-warning',
  completed: 'bg-success',
};

/** Percent complete (0-100) for a single tracked metric (a `Goal` or a `KeyResult`), derived from its tracking type. */
export function goalCompletion(metric: TrackedMetric): number {
  switch (metric.trackingType) {
    case 'numeric':
    case 'percent':
      return metric.targetValue <= 0 ? 0 : clampPercent((metric.currentValue / metric.targetValue) * 100);
    case 'boolean':
      return metric.currentValue > 0 ? 100 : 0;
    case 'milestone':
      if (metric.milestones.length === 0) return 0;
      return clampPercent((metric.milestones.filter((m) => m.done).length / metric.milestones.length) * 100);
  }
}

/** Status derived from a completion percent and, if in-progress, whether it's keeping pace with the period's elapsed time. */
export function deriveStatusFromCompletion(completion: number, period: Period | undefined): GoalStatus {
  if (completion >= 100) return 'completed';
  if (completion <= 0) return 'not-started';

  const pace = period ? periodElapsedPercent(period) : 0;
  return completion < pace - AT_RISK_PACE_BUFFER ? 'at-risk' : 'in-progress';
}

/** Status derived from a tracked metric's own completion and, for in-progress ones, its pace within the period. */
export function deriveGoalStatus(metric: TrackedMetric, period: Period | undefined): GoalStatus {
  return deriveStatusFromCompletion(goalCompletion(metric), period);
}

/** How far through a period we are today, as 0-100 (0 before start, 100 after end). */
function periodElapsedPercent(period: Period): number {
  const start = Date.parse(period.startDate);
  const end = Date.parse(period.endDate);
  const now = Date.now();
  if (end <= start) return 100;
  return clampPercent(((now - start) / (end - start)) * 100);
}

function weightedAverage(entries: readonly { readonly completion: number; readonly weight: number }[]): number {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) return 0;
  const weightedSum = entries.reduce((sum, entry) => sum + entry.completion * entry.weight, 0);
  return clampPercent(weightedSum / totalWeight);
}

/** Weighted-average completion across a member's goals within one period. */
export function memberCompletion(goals: readonly Goal[], memberId: string, periodId: string): number {
  const entries = goals
    .filter((goal) => goal.ownerId === memberId && goal.periodId === periodId)
    .map((goal) => ({ completion: goalCompletion(goal), weight: goal.weight }));
  return weightedAverage(entries);
}

/** Weighted-average completion across every goal within one period. */
export function teamCompletion(goals: readonly Goal[], periodId: string): number {
  const entries = goals
    .filter((goal) => goal.periodId === periodId)
    .map((goal) => ({ completion: goalCompletion(goal), weight: goal.weight }));
  return weightedAverage(entries);
}

/** Weighted-average completion across an objective's key results. */
export function objectiveCompletion(keyResults: readonly KeyResult[], objectiveId: string): number {
  const entries = keyResults
    .filter((keyResult) => keyResult.objectiveId === objectiveId)
    .map((keyResult) => ({ completion: goalCompletion(keyResult), weight: keyResult.weight }));
  return weightedAverage(entries);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
