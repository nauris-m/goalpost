import type { Json, Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types';
import type { Goal, GoalTrackingType, Milestone } from '@/lib/types/domain';

export function milestonesFromJson(value: Json): readonly Milestone[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
    const item = entry as Record<string, Json | undefined>;
    return [
      {
        id: typeof item.id === 'string' ? item.id : '',
        label: typeof item.label === 'string' ? item.label : '',
        done: item.done === true,
      },
    ];
  });
}

export function milestoneSet(labels: readonly (readonly [string, boolean])[]): readonly Milestone[] {
  return labels.map(([label, done], index) => ({ id: `${label.slice(0, 4).toLowerCase()}-${index}`, label, done }));
}

export function goalFromRow(row: Tables<'goals'>): Goal {
  return {
    id: row.id,
    periodId: row.period_id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    trackingType: row.tracking_type,
    targetValue: row.target_value,
    currentValue: row.current_value,
    unit: row.unit,
    milestones: milestonesFromJson(row.milestones),
    weight: row.weight,
  };
}

export function goalToInsert(input: {
  periodId: string;
  ownerId: string | null;
  title: string;
  description: string;
  trackingType: GoalTrackingType;
  targetValue: number;
  unit: string;
  weight: number;
  milestoneLabels: readonly string[];
}): TablesInsert<'goals'> {
  return {
    period_id: input.periodId,
    owner_id: input.ownerId,
    title: input.title,
    description: input.description,
    tracking_type: input.trackingType,
    target_value: input.trackingType === 'boolean' ? 1 : input.targetValue,
    current_value: 0,
    unit: input.unit,
    milestones: (input.trackingType === 'milestone' ? milestoneSet(input.milestoneLabels.map((label) => [label, false])) : []) as unknown as Json,
    weight: input.weight,
  };
}

export function goalToUpdate(patch: { currentValue?: number; milestones?: readonly Milestone[] }): TablesUpdate<'goals'> {
  const out: TablesUpdate<'goals'> = {};
  if (patch.currentValue !== undefined) out.current_value = patch.currentValue;
  if (patch.milestones !== undefined) out.milestones = patch.milestones as unknown as Json;
  return out;
}
