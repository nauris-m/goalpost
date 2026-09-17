import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/current-user';
import { activityEventFromRow } from '@/lib/mappers/activity-events';
import { NotificationsClient } from './notifications-client';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const supabase = await createClient();

  const [currentUser, { data: eventRows }] = await Promise.all([
    getCurrentUser(),
    supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  return <NotificationsClient currentUser={currentUser!} initialEvents={(eventRows ?? []).map(activityEventFromRow)} />;
}
