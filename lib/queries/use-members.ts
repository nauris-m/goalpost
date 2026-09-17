'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { memberFromRow, memberToInsert, memberToTeamUpdate, memberToUpdate } from '@/lib/mappers/members';
import { useRandomUserProfiles } from './use-random-users';
import type { Member, MemberView } from '@/lib/types/domain';

const MEMBERS_KEY = ['members'] as const;

export function useMembersQuery(initialData: Member[]): { data: MemberView[] } {
  const { data: members = initialData } = useQuery({
    queryKey: MEMBERS_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'member').order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(memberFromRow);
    },
    initialData,
  });

  const profiles = useRandomUserProfiles();

  const data = useMemo<MemberView[]>(
    () =>
      members.map((member, index) => ({
        ...member,
        avatarUrl: profiles.length > 0 ? (profiles[index % profiles.length]?.photoUrl ?? '') : '',
        initial: member.name.charAt(0).toUpperCase(),
      })),
    [members, profiles],
  );

  return { data };
}

export function useAddMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      name,
      position,
      email,
      addedBy,
    }: {
      teamId: string;
      name: string;
      position: string;
      email: string;
      addedBy: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').insert(memberToInsert(teamId, name, position, email, addedBy)).select().single();
      if (error) throw error;
      return memberFromRow(data);
    },
    onSuccess: (member) => {
      queryClient.setQueryData<Member[]>(MEMBERS_KEY, (all) => [...(all ?? []), member]);
    },
  });
}

export function useUpdateMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      memberId,
      fields,
    }: {
      memberId: string;
      fields: { name: string; position: string; contactInfo: string };
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').update(memberToUpdate(fields)).eq('id', memberId).select().single();
      if (error) throw error;
      return memberFromRow(data);
    },
    onSuccess: (member) => {
      queryClient.setQueryData<Member[]>(MEMBERS_KEY, (all) => (all ?? []).map((m) => (m.id === member.id ? member : m)));
    },
  });
}

export function useAssignMemberToTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, teamId }: { memberId: string; teamId: string | null }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('profiles').update(memberToTeamUpdate(teamId)).eq('id', memberId).select().single();
      if (error) throw error;
      return memberFromRow(data);
    },
    onSuccess: (member) => {
      queryClient.setQueryData<Member[]>(MEMBERS_KEY, (all) => (all ?? []).map((m) => (m.id === member.id ? member : m)));
    },
  });
}

export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('profiles').delete().eq('id', memberId);
      if (error) throw error;
      return memberId;
    },
    onSuccess: (memberId) => {
      queryClient.setQueryData<Member[]>(MEMBERS_KEY, (all) => (all ?? []).filter((m) => m.id !== memberId));
    },
  });
}
