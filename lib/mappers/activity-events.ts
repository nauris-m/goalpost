import type { Tables, TablesInsert } from '@/lib/types/database.types';
import type { ActivityEvent, ActivityVerb } from '@/lib/types/domain';

export function activityEventFromRow(row: Tables<'activity_events'>): ActivityEvent {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    verb: row.verb as ActivityVerb,
    summary: row.summary,
    targetTeamId: row.target_team_id,
    createdAt: row.created_at,
  };
}

export function activityEventToInsert(params: {
  actorId: string;
  actorName: string;
  verb: ActivityVerb;
  summary: string;
  targetTeamId: string | null;
}): TablesInsert<'activity_events'> {
  return {
    actor_id: params.actorId,
    actor_name: params.actorName,
    verb: params.verb,
    summary: params.summary,
    target_team_id: params.targetTeamId,
  };
}
