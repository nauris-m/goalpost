import type { Tables, TablesInsert } from '@/lib/types/database.types';
import type { Period } from '@/lib/types/domain';
import type { GeneratedPeriod } from '@/lib/domain/period-util';

export function periodFromRow(row: Tables<'periods'>): Period {
  return { id: row.id, teamId: row.team_id, name: row.name, startDate: row.start_date, endDate: row.end_date };
}

export function periodsToInsert(teamId: string, generated: readonly GeneratedPeriod[]): TablesInsert<'periods'>[] {
  return generated.map((p) => ({ team_id: teamId, name: p.name, start_date: p.startDate, end_date: p.endDate }));
}
