import type { Json, Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types';
import type { GoalTrackingType, KeyResult, Milestone } from '@/lib/types/domain';
import { milestonesFromJson, milestoneSet } from './goals';

export function keyResultFromRow(row: Tables<'key_results'>): KeyResult {
  return {
    id: row.id,
    objectiveId: row.objective_id,
    title: row.title,
    trackingType: row.tracking_type,
    targetValue: row.target_value,
    currentValue: row.current_value,
    unit: row.unit,
    milestones: milestonesFromJson(row.milestones),
    weight: row.weight,
  };
}

export function keyResultToInsert(
  objectiveId: string,
  input: {
    title: string;
    trackingType: GoalTrackingType;
    targetValue: number;
    unit: string;
    weight: number;
    milestoneLabels: readonly string[];
  },
): TablesInsert<'key_results'> {
  return {
    objective_id: objectiveId,
    title: input.title,
    tracking_type: input.trackingType,
    target_value: input.trackingType === 'boolean' ? 1 : input.targetValue,
    current_value: 0,
    unit: input.unit,
    milestones: (input.trackingType === 'milestone' ? milestoneSet(input.milestoneLabels.map((label) => [label, false])) : []) as unknown as Json,
    weight: input.weight,
  };
}

export function keyResultToUpdate(patch: { currentValue?: number; milestones?: readonly Milestone[] }): TablesUpdate<'key_results'> {
  const out: TablesUpdate<'key_results'> = {};
  if (patch.currentValue !== undefined) out.current_value = patch.currentValue;
  if (patch.milestones !== undefined) out.milestones = patch.milestones as unknown as Json;
  return out;
}
