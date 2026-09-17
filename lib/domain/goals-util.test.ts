import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deriveGoalStatus,
  deriveStatusFromCompletion,
  goalCompletion,
  memberCompletion,
  objectiveCompletion,
  teamCompletion,
} from './goals-util';
import { Goal, KeyResult, Period } from '@/lib/types/domain';

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    periodId: 'p1',
    ownerId: 'm1',
    title: 'Goal',
    description: '',
    trackingType: 'numeric',
    targetValue: 100,
    currentValue: 0,
    unit: '',
    milestones: [],
    weight: 1,
    ...overrides,
  };
}

const PERIOD: Period = { id: 'p1', teamId: 't1', name: 'Q1 2026', startDate: '2026-01-01', endDate: '2026-01-31' };

describe('goalCompletion', () => {
  it('computes numeric/percent completion as current/target', () => {
    expect(goalCompletion(makeGoal({ trackingType: 'numeric', currentValue: 50, targetValue: 100 }))).toBe(50);
  });

  it('clamps completion to 100 even if current exceeds target', () => {
    expect(goalCompletion(makeGoal({ trackingType: 'numeric', currentValue: 150, targetValue: 100 }))).toBe(100);
  });

  it('treats a zero target as 0% instead of dividing by zero', () => {
    expect(goalCompletion(makeGoal({ trackingType: 'numeric', targetValue: 0, currentValue: 5 }))).toBe(0);
  });

  it('treats boolean goals as 0 or 100', () => {
    expect(goalCompletion(makeGoal({ trackingType: 'boolean', currentValue: 0 }))).toBe(0);
    expect(goalCompletion(makeGoal({ trackingType: 'boolean', currentValue: 1 }))).toBe(100);
  });

  it('computes milestone completion as done/total', () => {
    const goal = makeGoal({
      trackingType: 'milestone',
      milestones: [
        { id: 'a', label: 'A', done: true },
        { id: 'b', label: 'B', done: true },
        { id: 'c', label: 'C', done: false },
        { id: 'd', label: 'D', done: false },
      ],
    });
    expect(goalCompletion(goal)).toBe(50);
  });

  it('treats a goal with no milestones as 0%', () => {
    expect(goalCompletion(makeGoal({ trackingType: 'milestone', milestones: [] }))).toBe(0);
  });
});

describe('deriveGoalStatus', () => {
  beforeEach(() => {
    // roughly halfway through PERIOD (Jan 1 - Jan 31, 2026)
    vi.setSystemTime(new Date('2026-01-16T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is not-started at 0% completion', () => {
    expect(deriveGoalStatus(makeGoal({ currentValue: 0 }), PERIOD)).toBe('not-started');
  });

  it('is completed at 100%+', () => {
    expect(deriveGoalStatus(makeGoal({ currentValue: 100 }), PERIOD)).toBe('completed');
  });

  it('is in-progress when roughly keeping pace with the period', () => {
    expect(deriveGoalStatus(makeGoal({ currentValue: 50 }), PERIOD)).toBe('in-progress');
  });

  it('is at-risk when well behind the period pace', () => {
    expect(deriveGoalStatus(makeGoal({ currentValue: 10 }), PERIOD)).toBe('at-risk');
  });
});

describe('memberCompletion / teamCompletion', () => {
  const goals: readonly Goal[] = [
    makeGoal({ id: 'g1', ownerId: 'm1', periodId: 'p1', currentValue: 50, targetValue: 100, weight: 1 }),
    makeGoal({ id: 'g2', ownerId: 'm1', periodId: 'p1', currentValue: 100, targetValue: 100, weight: 3 }),
    makeGoal({ id: 'g3', ownerId: 'm2', periodId: 'p1', trackingType: 'boolean', currentValue: 1, weight: 1 }),
    makeGoal({ id: 'g4', ownerId: 'm1', periodId: 'p2', currentValue: 0, targetValue: 100, weight: 1 }),
  ];

  it("weights a member's goals within a period", () => {
    expect(memberCompletion(goals, 'm1', 'p1')).toBe(88); // (50*1 + 100*3) / 4 = 87.5 -> 88
  });

  it('ignores goals outside the requested period', () => {
    expect(memberCompletion(goals, 'm1', 'p2')).toBe(0);
  });

  it('returns 0 for a member with no goals in the period', () => {
    expect(memberCompletion(goals, 'm3', 'p1')).toBe(0);
  });

  it('averages every goal in a period across all members', () => {
    expect(teamCompletion(goals, 'p1')).toBe(90); // (50*1 + 100*3 + 100*1) / 5 = 90
  });

  it('returns 0 for a period with no goals', () => {
    expect(teamCompletion(goals, 'p-empty')).toBe(0);
  });
});

function makeKeyResult(overrides: Partial<KeyResult> = {}): KeyResult {
  return {
    id: 'kr1',
    objectiveId: 'obj1',
    title: 'Key Result',
    trackingType: 'numeric',
    targetValue: 100,
    currentValue: 0,
    unit: '',
    milestones: [],
    weight: 1,
    ...overrides,
  };
}

describe('objectiveCompletion', () => {
  it("weights an objective's key results", () => {
    const keyResults: readonly KeyResult[] = [
      makeKeyResult({ id: 'kr1', objectiveId: 'obj1', currentValue: 40, targetValue: 100, weight: 1 }),
      makeKeyResult({ id: 'kr2', objectiveId: 'obj1', currentValue: 80, targetValue: 100, weight: 1 }),
      makeKeyResult({ id: 'kr3', objectiveId: 'obj2', currentValue: 0, targetValue: 100, weight: 1 }),
    ];
    expect(objectiveCompletion(keyResults, 'obj1')).toBe(60); // (40 + 80) / 2
  });

  it('returns 0 for an objective with no key results', () => {
    expect(objectiveCompletion([], 'obj1')).toBe(0);
  });
});

describe('deriveStatusFromCompletion', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-01-16T00:00:00Z')); // roughly halfway through PERIOD
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is not-started at 0%', () => {
    expect(deriveStatusFromCompletion(0, PERIOD)).toBe('not-started');
  });

  it('is completed at 100%+', () => {
    expect(deriveStatusFromCompletion(100, PERIOD)).toBe('completed');
  });

  it('is in-progress when roughly keeping pace', () => {
    expect(deriveStatusFromCompletion(50, PERIOD)).toBe('in-progress');
  });

  it('is at-risk when well behind pace', () => {
    expect(deriveStatusFromCompletion(10, PERIOD)).toBe('at-risk');
  });

  it('treats a missing period as fully elapsed (0% pace baseline)', () => {
    expect(deriveStatusFromCompletion(50, undefined)).toBe('in-progress');
  });
});
