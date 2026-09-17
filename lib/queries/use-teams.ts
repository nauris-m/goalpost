'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { teamFromRow, teamToInsert, teamToUpdate } from '@/lib/mappers/teams';
import type { Team } from '@/lib/types/domain';

const TEAMS_KEY = ['teams'] as const;

export function useTeamsQuery(initialData: Team[]) {
  return useQuery({
    queryKey: TEAMS_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data.map(teamFromRow);
    },
    initialData,
  });
}

export function useAddTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description, managerId }: { name: string; description: string; managerId: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('teams').insert(teamToInsert(name, description, managerId)).select().single();
      if (error) throw error;
      return teamFromRow(data);
    },
    onSuccess: (team) => {
      queryClient.setQueryData<Team[]>(TEAMS_KEY, (all) => [...(all ?? []), team]);
    },
  });
}

export function useUpdateTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, fields }: { teamId: string; fields: { name: string; description: string } }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('teams').update(teamToUpdate(fields)).eq('id', teamId).select().single();
      if (error) throw error;
      return teamFromRow(data);
    },
    onSuccess: (team) => {
      queryClient.setQueryData<Team[]>(TEAMS_KEY, (all) => (all ?? []).map((t) => (t.id === team.id ? team : t)));
    },
  });
}

export function useDeleteTeamMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) throw error;
      return teamId;
    },
    onSuccess: (teamId) => {
      queryClient.setQueryData<Team[]>(TEAMS_KEY, (all) => (all ?? []).filter((t) => t.id !== teamId));
    },
  });
}
