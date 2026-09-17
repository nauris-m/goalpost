import type { Tables, TablesUpdate } from '@/lib/types/database.types';
import type { AuthUser } from '@/lib/types/domain';

export function authUserFromProfileRow(row: Tables<'profiles'>): AuthUser {
  return {
    role: row.role,
    id: row.id,
    name: row.name,
    title: row.title,
    contactInfo: row.contact_info,
    email: row.email,
    notificationsReadAt: row.notifications_read_at,
  };
}

export function profileToUpdate(fields: { name: string; title: string; contactInfo: string }): TablesUpdate<'profiles'> {
  return { name: fields.name, title: fields.title, contact_info: fields.contactInfo };
}
