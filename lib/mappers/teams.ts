import type { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types';
import type { Team } from '@/lib/types/domain';

export function teamFromRow(row: Tables<'teams'>): Team {
  return { id: row.id, name: row.name, description: row.description, managerId: row.manager_id };
}

export function teamToInsert(name: string, description: string, managerId: string): TablesInsert<'teams'> {
  return { name, description, manager_id: managerId };
}

export function teamToUpdate(fields: { name: string; description: string }): TablesUpdate<'teams'> {
  return { name: fields.name, description: fields.description };
}
