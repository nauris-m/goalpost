'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { goalFromRow, goalToInsert, goalToUpdate } from '@/lib/mappers/goals';
import type { Goal, GoalTrackingType } from '@/lib/types/domain';

const GOALS_KEY = ['goals'] as const;

export function useGoalsQuery(initialData: Goal[]) {
  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('goals').select('*').order('title', { ascending: true });
      if (error) throw error;
      return data.map(goalFromRow);
    },
    initialData,
  });
}

export function useAddGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      periodId: string;
      ownerId: string | null;
      title: string;
      description: string;
      trackingType: GoalTrackingType;
      targetValue: number;
      unit: string;
      weight: number;
      milestoneLabels: readonly string[];
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('goals').insert(goalToInsert(input)).select().single();
      if (error) throw error;
      return goalFromRow(data);
    },
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal[]>(GOALS_KEY, (all) => [...(all ?? []), goal]);
    },
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goalId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('goals').delete().eq('id', goalId);
      if (error) throw error;
      return goalId;
    },
    onSuccess: (goalId) => {
      queryClient.setQueryData<Goal[]>(GOALS_KEY, (all) => (all ?? []).filter((g) => g.id !== goalId));
    },
  });
}

export function useUpdateGoalProgressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, currentValue }: { goalId: string; currentValue: number }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('goals').update(goalToUpdate({ currentValue })).eq('id', goalId).select().single();
      if (error) throw error;
      return goalFromRow(data);
    },
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal[]>(GOALS_KEY, (all) => (all ?? []).map((g) => (g.id === goal.id ? goal : g)));
    },
  });
}

export function useToggleGoalMilestoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ goal, milestoneId }: { goal: Goal; milestoneId: string }) => {
      const milestones = goal.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
      const supabase = createClient();
      const { data, error } = await supabase.from('goals').update(goalToUpdate({ milestones })).eq('id', goal.id).select().single();
      if (error) throw error;
      return goalFromRow(data);
    },
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal[]>(GOALS_KEY, (all) => (all ?? []).map((g) => (g.id === goal.id ? goal : g)));
    },
  });
}
