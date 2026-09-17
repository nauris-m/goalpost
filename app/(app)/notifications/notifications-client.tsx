'use client';

import { useMemo } from 'react';
import { Bell, CircleCheck, TrendingUp, UserMinus, UserPlus, UserRound, UserX, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useActivityEventsQuery,
  useMarkAllReadMutation,
  useNotificationsReadAtQuery,
} from '@/lib/queries/use-notifications';
import type { ActivityEvent, ActivityVerb, AuthUser } from '@/lib/types/domain';

const VERB_ICONS: Record<ActivityVerb, LucideIcon> = {
  'team.created': Users,
  'team.updated': Users,
  'team.deleted': Users,
  'member.added': UserPlus,
  'member.updated': UserRound,
  'member.removed': UserMinus,
  'member.deleted': UserX,
  'goal.progress_updated': TrendingUp,
  'goal.milestone_toggled': CircleCheck,
  'profile.updated': UserRound,
};

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function EventRow({ event, unread }: { event: ActivityEvent; unread: boolean }) {
  const Icon = VERB_ICONS[event.verb] ?? Bell;
  return (
    <li className={`flex items-center gap-3 px-5 py-3 ${unread ? 'bg-accent/40' : ''}`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-foreground">
          <span className="font-medium">{event.actorName}</span> {event.summary}
        </span>
        <span className="block text-xs text-muted-foreground">{timeAgo(event.createdAt)}</span>
      </span>
      {unread && <span className="size-2 shrink-0 rounded-full bg-primary" />}
    </li>
  );
}

function EventList({ events, unreadIds }: { events: ActivityEvent[]; unreadIds: Set<string> }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      {events.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {events.map((event) => (
            <EventRow key={event.id} event={event} unread={unreadIds.has(event.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function NotificationsClient({ currentUser, initialEvents }: { currentUser: AuthUser; initialEvents: ActivityEvent[] }) {
  const { data: events = initialEvents } = useActivityEventsQuery(initialEvents);
  const { data: readAt } = useNotificationsReadAtQuery(currentUser);
  const markAllRead = useMarkAllReadMutation(currentUser);

  const mine = useMemo(() => events.filter((e) => e.actorId === currentUser.id), [events, currentUser.id]);
  const others = useMemo(() => events.filter((e) => e.actorId !== currentUser.id), [events, currentUser.id]);

  const unreadIds = useMemo(() => {
    const threshold = readAt ? Date.parse(readAt) : 0;
    return new Set(others.filter((e) => Date.parse(e.createdAt) > threshold).map((e) => e.id));
  }, [others, readAt]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        {unreadIds.size > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="others">
            By others{unreadIds.size > 0 && ` (${unreadIds.size})`}
          </TabsTrigger>
          <TabsTrigger value="mine">By me</TabsTrigger>
        </TabsList>
        <TabsContent value="others">
          <EventList events={others} unreadIds={unreadIds} />
        </TabsContent>
        <TabsContent value="mine">
          <EventList events={mine} unreadIds={new Set()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
