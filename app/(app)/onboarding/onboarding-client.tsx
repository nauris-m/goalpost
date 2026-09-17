'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, ChevronRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AddMembersStep } from '@/components/team-setup/add-members-step';
import { useAddTeamMutation, useTeamsQuery } from '@/lib/queries/use-teams';
import { useLogActivity } from '@/lib/queries/use-notifications';
import type { AuthUser, Member, Team } from '@/lib/types/domain';

export function OnboardingClient({
  currentUser,
  initialMembers,
  initialTeams,
}: {
  currentUser: AuthUser;
  initialMembers: Member[];
  initialTeams: Team[];
}) {
  const router = useRouter();
  // Seeds the shared `['teams']` cache with the full list *before* useAddTeamMutation's
  // onSuccess can append to it - otherwise onSuccess appends to an empty cache instead.
  useTeamsQuery(initialTeams);
  const addTeam = useAddTeamMutation();
  const logActivity = useLogActivity();

  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [addedMembers, setAddedMembers] = useState<Member[]>([]);

  async function createTeam() {
    if (!teamName.trim()) return;
    try {
      const created = await addTeam.mutateAsync({ name: teamName.trim(), description: teamDescription.trim(), managerId: currentUser.id });
      if (created) {
        setTeam(created);
        logActivity({
          actorId: currentUser.id,
          actorName: currentUser.name,
          verb: 'team.created',
          summary: `created the "${created.name}" team.`,
          targetTeamId: created.id,
        });
      }
    } catch {
      toast.error('Failed to create the team.');
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2 text-primary">
        <Flag className="size-5" />
        <span className="text-lg font-bold text-foreground">Welcome to Goalpost</span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className={`flex items-center gap-1.5 ${team ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
          <span className={`flex size-5 items-center justify-center rounded-full text-xs ${team ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}`}>
            {team ? <Check className="size-3" /> : '1'}
          </span>
          Team
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
        <div className={`flex items-center gap-1.5 ${team ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
          <span className={`flex size-5 items-center justify-center rounded-full text-xs ${team ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            2
          </span>
          Employees
        </div>
      </div>

      {!team ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">Name your team</h1>
          <p className="mt-1 text-sm text-muted-foreground">This is the workspace you&apos;ll invite your employees into.</p>
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="team-name">Team name</Label>
              <Input id="team-name" placeholder="e.g. Product Team" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="team-description">Description (optional)</Label>
              <Input id="team-description" placeholder="e.g. Core product squad" value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} />
            </div>
            <Button type="button" disabled={!teamName.trim() || addTeam.isPending} onClick={createTeam} className="self-start">
              {addTeam.isPending ? 'Creating…' : 'Create team'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-foreground">Add your employees</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add people one at a time, or import a CSV. They&apos;ll show up as <Badge variant="secondary">Invited</Badge> until they
              sign up with that email.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <AddMembersStep
                team={team}
                currentUser={currentUser}
                initialMembers={initialMembers}
                initialTeams={initialTeams}
                onMemberAdded={(member) => setAddedMembers((all) => [...all, member])}
              />
            </div>
          </div>

          {addedMembers.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-medium text-foreground">Added this session ({addedMembers.length})</h2>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {addedMembers.map((member) => (
                  <Badge key={member.id} variant="secondary">
                    {member.name}
                  </Badge>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.push('/')}>
              Skip for now
            </Button>
            <Button type="button" onClick={() => router.push('/')}>
              Finish
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
