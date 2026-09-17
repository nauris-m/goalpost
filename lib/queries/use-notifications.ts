'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { activityEventFromRow, activityEventToInsert } from '@/lib/mappers/activity-events';
import type { ActivityEvent, ActivityVerb, AuthUser } from '@/lib/types/domain';

const ACTIVITY_EVENTS_KEY = ['activity-events'] as const;

export function useActivityEventsQuery(initialData?: ActivityEvent[]) {
  return useQuery({
    queryKey: ACTIVITY_EVENTS_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data.map(activityEventFromRow);
    },
    initialData,
  });
}

function readAtKey(userId: string) {
  return ['notifications-read-at', userId] as const;
}

export function useNotificationsReadAtQuery(currentUser: AuthUser) {
  return useQuery({
    queryKey: readAtKey(currentUser.id),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').select('notifications_read_at').eq('id', currentUser.id).single();
      if (error) throw error;
      return data.notifications_read_at;
    },
    initialData: currentUser.notificationsReadAt,
  });
}

export function useMarkAllReadMutation(currentUser: AuthUser) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const readAt = new Date().toISOString();
      const { error } = await supabase.from('profiles').update({ notifications_read_at: readAt }).eq('id', currentUser.id);
      if (error) throw error;
      return readAt;
    },
    onSuccess: (readAt) => {
      queryClient.setQueryData(readAtKey(currentUser.id), readAt);
    },
  });
}

export function useUnreadNotificationCount(currentUser: AuthUser): number {
  const { data: events } = useActivityEventsQuery();
  const { data: readAt } = useNotificationsReadAtQuery(currentUser);

  return useMemo(() => {
    const threshold = readAt ? Date.parse(readAt) : 0;
    return (events ?? []).filter((e) => e.actorId !== currentUser.id && Date.parse(e.createdAt) > threshold).length;
  }, [events, readAt, currentUser.id]);
}

/** Best-effort audit log write - failures are logged, not surfaced, so a broken log never blocks the user's actual action. */
export function useLogActivity() {
  const queryClient = useQueryClient();

  return async function logActivity(params: {
    actorId: string;
    actorName: string;
    verb: ActivityVerb;
    summary: string;
    targetTeamId: string | null;
  }) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('activity_events').insert(activityEventToInsert(params)).select().single();
      if (error) throw error;
      const event = activityEventFromRow(data);
      queryClient.setQueryData<ActivityEvent[]>(ACTIVITY_EVENTS_KEY, (all) => [event, ...(all ?? [])]);
    } catch (err) {
      console.error('Failed to log activity event', err);
    }
  };
}
