export type UserRole = 'manager' | 'member';

export interface AuthUser {
  readonly role: UserRole;
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly contactInfo: string;
  readonly email: string;
  readonly notificationsReadAt: string | null;
}

export interface Team {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly managerId: string;
}

export interface Member {
  readonly id: string;
  /** Empty when the member's team was deleted (team_id is set-null on team delete) - see `addedBy`. */
  readonly teamId: string;
  readonly name: string;
  readonly position: string;
  readonly contactInfo: string;
  readonly email: string;
  /** Whether this member has signed up and claimed their invite, or is still just a pending roster entry. */
  readonly claimed: boolean;
  /** The manager who added this member - stays set even if their team is later deleted. */
  readonly addedBy: string | null;
}

export interface MemberView extends Member {
  readonly avatarUrl: string;
  readonly initial: string;
}

export interface Period {
  readonly id: string;
  readonly teamId: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

export type GoalTrackingType = 'numeric' | 'percent' | 'boolean' | 'milestone';

export type GoalStatus = 'not-started' | 'in-progress' | 'at-risk' | 'completed';

export interface Milestone {
  readonly id: string;
  readonly label: string;
  readonly done: boolean;
}

/** The trackable-metric fields shared by `Goal` and `KeyResult`, so completion/status logic works on either. */
export interface TrackedMetric {
  readonly trackingType: GoalTrackingType;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly milestones: readonly Milestone[];
}

/** What `GoalProgress` needs to render/edit a tracked metric's progress control - satisfied by both `Goal` and `KeyResult`. */
export interface ProgressTrackable extends TrackedMetric {
  readonly id: string;
  readonly unit: string;
}

export interface Goal extends TrackedMetric {
  readonly id: string;
  readonly periodId: string;
  /** The member this goal belongs to, or `null` for a team-wide goal with no individual owner. */
  readonly ownerId: string | null;
  readonly title: string;
  readonly description: string;
  readonly unit: string;
  readonly weight: number;
}

/** A qualitative objective, scored by rolling up the completion of its Key Results. */
export interface Objective {
  readonly id: string;
  readonly periodId: string;
  /** The member this objective belongs to, or `null` for a whole-team objective. */
  readonly ownerId: string | null;
  readonly title: string;
  readonly description: string;
}

/** A single measurable result under an Objective. */
export interface KeyResult extends TrackedMetric {
  readonly id: string;
  readonly objectiveId: string;
  readonly title: string;
  readonly unit: string;
  readonly weight: number;
}

export type ActivityVerb =
  | 'team.created'
  | 'team.updated'
  | 'team.deleted'
  | 'member.added'
  | 'member.updated'
  | 'member.removed'
  | 'member.deleted'
  | 'goal.progress_updated'
  | 'goal.milestone_toggled'
  | 'profile.updated';

/** A single row in the activity/notifications log. `summary` is subject-less prose (e.g. "added Alex to the team.") - the UI prefixes it with `actorName`. */
export interface ActivityEvent {
  readonly id: string;
  readonly actorId: string | null;
  readonly actorName: string;
  readonly verb: ActivityVerb;
  readonly summary: string;
  readonly targetTeamId: string | null;
  readonly createdAt: string;
}
