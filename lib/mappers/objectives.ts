import type { Tables, TablesInsert } from '@/lib/types/database.types';
import type { Objective } from '@/lib/types/domain';

export function objectiveFromRow(row: Tables<'objectives'>): Objective {
  return { id: row.id, periodId: row.period_id, ownerId: row.owner_id, title: row.title, description: row.description };
}

export function objectiveToInsert(periodId: string, ownerId: string | null, title: string, description: string): TablesInsert<'objectives'> {
  return { period_id: periodId, owner_id: ownerId, title, description };
}
