'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, Pencil, Trash2, UserMinus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AddMembersStep } from '@/components/team-setup/add-members-step';
import { MemberAvatar } from '@/components/shared/member-avatar';
import { useDeleteTeamMutation, useTeamsQuery, useUpdateTeamMutation } from '@/lib/queries/use-teams';
import { useAssignMemberToTeamMutation, useMembersQuery, useUpdateMemberMutation } from '@/lib/queries/use-members';
import { useLogActivity } from '@/lib/queries/use-notifications';
import type { AuthUser, Member, MemberView, Team } from '@/lib/types/domain';

function MemberRow({
  member,
  currentUser,
  team,
}: {
  member: MemberView;
  currentUser: AuthUser;
  team: Team;
}) {
  const updateMember = useUpdateMemberMutation();
  const unassignMember = useAssignMemberToTeamMutation();
  const logActivity = useLogActivity();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [position, setPosition] = useState(member.position);
  const [contactInfo, setContactInfo] = useState(member.contactInfo);

  function startEdit() {
    setName(member.name);
    setPosition(member.position);
    setContactInfo(member.contactInfo);
    setEditing(true);
  }

  function saveEdit() {
    if (!name.trim()) return;
    updateMember.mutate(
      { memberId: member.id, fields: { name: name.trim(), position: position.trim(), contactInfo: contactInfo.trim() } },
      {
        onSuccess: (updated) => {
          setEditing(false);
          logActivity({
            actorId: currentUser.id,
            actorName: currentUser.name,
            verb: 'member.updated',
            summary: `updated ${updated.name}'s details.`,
            targetTeamId: team.id,
          });
        },
        onError: () => toast.error('Failed to save changes.'),
      },
    );
  }

  function removeFromTeam() {
    unassignMember.mutate(
      { memberId: member.id, teamId: null },
      {
        onSuccess: () => {
          toast.success(`Removed ${member.name} from the team.`);
          logActivity({
            actorId: currentUser.id,
            actorName: currentUser.name,
            verb: 'member.removed',
            summary: `removed ${member.name} from the team.`,
            targetTeamId: team.id,
          });
        },
        onError: () => toast.error('Failed to remove from team.'),
      },
    );
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 px-5 py-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
          <Input placeholder="Contact info" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={saveEdit} disabled={!name.trim() || updateMember.isPending}>
            Save
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <MemberAvatar name={member.name} initial={member.initial} avatarUrl={member.avatarUrl} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{member.name}</span>
          {!member.claimed && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Invited
            </Badge>
          )}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {member.email}
          {member.position && ` · ${member.position}`}
        </span>
      </span>
      <Button type="button" variant="ghost" size="icon-sm" onClick={startEdit} aria-label={`Edit ${member.name}`}>
        <Pencil className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={removeFromTeam}
        disabled={unassignMember.isPending}
        aria-label={`Remove ${member.name} from team`}
      >
        <UserMinus className="size-3.5" />
      </Button>
    </li>
  );
}

export function TeamDetailClient({
  currentUser,
  initialTeam,
  initialMembers,
  initialTeams,
}: {
  currentUser: AuthUser;
  initialTeam: Team;
  initialMembers: Member[];
  initialTeams: Team[];
}) {
  const router = useRouter();
  const { data: teams } = useTeamsQuery(initialTeams);
  const { data: members } = useMembersQuery(initialMembers);
  const updateTeam = useUpdateTeamMutation();
  const deleteTeam = useDeleteTeamMutation();
  const logActivity = useLogActivity();

  const team = teams.find((t) => t.id === initialTeam.id) ?? initialTeam;
  const teamMembers = members.filter((m) => m.teamId === team.id);

  const [editingTeam, setEditingTeam] = useState(false);
  const [teamName, setTeamName] = useState(team.name);
  const [teamDescription, setTeamDescription] = useState(team.description);

  function startEditTeam() {
    setTeamName(team.name);
    setTeamDescription(team.description);
    setEditingTeam(true);
  }

  function saveTeam() {
    if (!teamName.trim()) return;
    updateTeam.mutate(
      { teamId: team.id, fields: { name: teamName.trim(), description: teamDescription.trim() } },
      {
        onSuccess: (updated) => {
          setEditingTeam(false);
          logActivity({
            actorId: currentUser.id,
            actorName: currentUser.name,
            verb: 'team.updated',
            summary: `updated the "${updated.name}" team's details.`,
            targetTeamId: updated.id,
          });
        },
        onError: () => toast.error('Failed to save changes.'),
      },
    );
  }

  function confirmDeleteTeam() {
    deleteTeam.mutate(team.id, {
      onSuccess: () => {
        toast.success(`Deleted "${team.name}".`);
        logActivity({
          actorId: currentUser.id,
          actorName: currentUser.name,
          verb: 'team.deleted',
          summary: `deleted the "${team.name}" team.`,
          targetTeamId: null,
        });
        router.push('/teams');
      },
      onError: () => toast.error('Failed to delete the team.'),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/teams" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-3.5" /> Teams
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {editingTeam ? (
          <div className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-team-name">Team name</Label>
              <Input id="edit-team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-team-description">Description</Label>
              <Input id="edit-team-description" value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={saveTeam} disabled={!teamName.trim() || updateTeam.isPending}>
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setEditingTeam(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{team.name}</h1>
              {team.description && <p className="mt-1 text-sm text-muted-foreground">{team.description}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={startEditTeam}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button type="button" variant="destructive" size="sm">
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete &quot;{team.name}&quot;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This also removes its periods and goals. Members stay in your roster, unassigned - you can add them
                      to another team later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteTeam}>Delete team</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      <DashboardCard title={`Members (${teamMembers.length})`} bodyClassName="p-0">
        {teamMembers.length === 0 ? (
          <div className="flex flex-col items-start gap-2 p-6">
            <Users className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No members on this team yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {teamMembers.map((member) => (
              <MemberRow key={member.id} member={member} currentUser={currentUser} team={team} />
            ))}
          </ul>
        )}
      </DashboardCard>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Add people to this team</h2>
        <div className="mt-4 flex flex-col gap-2">
          <AddMembersStep team={team} currentUser={currentUser} initialMembers={initialMembers} initialTeams={initialTeams} onMemberAdded={() => {}} />
        </div>
      </div>
    </div>
  );
}
