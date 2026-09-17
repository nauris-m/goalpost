import type { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database.types';
import type { Member } from '@/lib/types/domain';

export function memberFromRow(row: Tables<'profiles'>): Member {
  return {
    id: row.id,
    teamId: row.team_id ?? '',
    name: row.name,
    position: row.title,
    contactInfo: row.contact_info,
    email: row.email,
    claimed: row.auth_user_id !== null,
    addedBy: row.added_by,
  };
}

export function memberToInsert(teamId: string, name: string, position: string, email: string, addedBy: string): TablesInsert<'profiles'> {
  return { team_id: teamId, name, title: position, email, role: 'member', added_by: addedBy };
}

export function memberToUpdate(fields: { name: string; position: string; contactInfo: string }): TablesUpdate<'profiles'> {
  return { name: fields.name, title: fields.position, contact_info: fields.contactInfo };
}

export function memberToTeamUpdate(teamId: string | null): TablesUpdate<'profiles'> {
  return { team_id: teamId };
}
