'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Trash2, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { MemberAvatar } from '@/components/shared/member-avatar';
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
import { useMembersQuery, useRemoveMemberMutation, useUpdateMemberMutation } from '@/lib/queries/use-members';
import { useTeamsQuery } from '@/lib/queries/use-teams';
import { useLogActivity } from '@/lib/queries/use-notifications';
import type { AuthUser, Member, MemberView, Team } from '@/lib/types/domain';

function MemberRow({ member, teamName, currentUser }: { member: MemberView; teamName: string | undefined; currentUser: AuthUser }) {
  const updateMember = useUpdateMemberMutation();
  const removeMember = useRemoveMemberMutation();
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
            targetTeamId: updated.teamId || null,
          });
        },
        onError: () => toast.error('Failed to save changes.'),
      },
    );
  }

  function confirmDelete() {
    removeMember.mutate(member.id, {
      onSuccess: () => {
        toast.success(`Deleted ${member.name}.`);
        logActivity({
          actorId: currentUser.id,
          actorName: currentUser.name,
          verb: 'member.deleted',
          summary: `deleted ${member.name} from the roster.`,
          targetTeamId: member.teamId || null,
        });
      },
      onError: () => toast.error('Failed to delete member.'),
    });
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
      <span className="shrink-0 text-xs text-muted-foreground">
        {teamName ? (
          <Link href={`/teams/${member.teamId}`} className="hover:text-primary hover:underline">
            {teamName}
          </Link>
        ) : (
          <span className="italic">No team</span>
        )}
      </span>
      <Button type="button" variant="ghost" size="icon-sm" onClick={startEdit} aria-label={`Edit ${member.name}`}>
        <Pencil className="size-3.5" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${member.name}`}>
              <Trash2 className="size-3.5" />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {member.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes them from your roster - unlike removing them from a team, this can&apos;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

export function MembersClient({
  currentUser,
  initialMembers,
  initialTeams,
}: {
  currentUser: AuthUser;
  initialMembers: Member[];
  initialTeams: Team[];
}) {
  const { data: members } = useMembersQuery(initialMembers);
  const { data: teams } = useTeamsQuery(initialTeams);
  const [search, setSearch] = useState('');

  const teamNameById = useMemo(() => new Map(teams.map((t) => [t.id, t.name])), [teams]);

  const myMembers = useMemo(() => members.filter((m) => m.addedBy === currentUser.id), [members, currentUser.id]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return myMembers;
    return myMembers.filter((m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query));
  }, [myMembers, search]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Members</h1>
        <p className="text-sm text-muted-foreground">Everyone you&apos;ve added, across every team - including anyone whose team was later removed.</p>
      </div>

      <DashboardCard
        title={`All members (${myMembers.length})`}
        action={
          myMembers.length > 0 && (
            <Input placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-56" />
          )
        }
        bodyClassName="p-0"
      >
        {myMembers.length === 0 ? (
          <div className="flex flex-col items-start gap-3 p-8">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You haven&apos;t added any employees yet.</p>
            <Button render={<Link href="/onboarding" />} nativeButton={false} size="sm">
              Add employees
            </Button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No members match your search.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredMembers.map((member) => (
              <MemberRow key={member.id} member={member} teamName={member.teamId ? teamNameById.get(member.teamId) : undefined} currentUser={currentUser} />
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
