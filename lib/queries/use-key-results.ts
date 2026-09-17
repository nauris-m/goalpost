'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { keyResultFromRow, keyResultToInsert, keyResultToUpdate } from '@/lib/mappers/key-results';
import type { GoalTrackingType, KeyResult } from '@/lib/types/domain';

const KEY_RESULTS_KEY = ['key-results'] as const;

export function useKeyResultsQuery(initialData: KeyResult[]) {
  return useQuery({
    queryKey: KEY_RESULTS_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('key_results').select('*').order('title', { ascending: true });
      if (error) throw error;
      return data.map(keyResultFromRow);
    },
    initialData,
  });
}

export function useAddKeyResultMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      objectiveId,
      input,
    }: {
      objectiveId: string;
      input: { title: string; trackingType: GoalTrackingType; targetValue: number; unit: string; weight: number; milestoneLabels: readonly string[] };
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('key_results').insert(keyResultToInsert(objectiveId, input)).select().single();
      if (error) throw error;
      return keyResultFromRow(data);
    },
    onSuccess: (keyResult) => {
      queryClient.setQueryData<KeyResult[]>(KEY_RESULTS_KEY, (all) => [...(all ?? []), keyResult]);
    },
  });
}

export function useDeleteKeyResultMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (keyResultId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('key_results').delete().eq('id', keyResultId);
      if (error) throw error;
      return keyResultId;
    },
    onSuccess: (keyResultId) => {
      queryClient.setQueryData<KeyResult[]>(KEY_RESULTS_KEY, (all) => (all ?? []).filter((kr) => kr.id !== keyResultId));
    },
  });
}

export function useUpdateKeyResultProgressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ keyResultId, currentValue }: { keyResultId: string; currentValue: number }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('key_results').update(keyResultToUpdate({ currentValue })).eq('id', keyResultId).select().single();
      if (error) throw error;
      return keyResultFromRow(data);
    },
    onSuccess: (keyResult) => {
      queryClient.setQueryData<KeyResult[]>(KEY_RESULTS_KEY, (all) => (all ?? []).map((kr) => (kr.id === keyResult.id ? keyResult : kr)));
    },
  });
}

export function useToggleKeyResultMilestoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ keyResult, milestoneId }: { keyResult: KeyResult; milestoneId: string }) => {
      const milestones = keyResult.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
      const supabase = createClient();
      const { data, error } = await supabase.from('key_results').update(keyResultToUpdate({ milestones })).eq('id', keyResult.id).select().single();
      if (error) throw error;
      return keyResultFromRow(data);
    },
    onSuccess: (keyResult) => {
      queryClient.setQueryData<KeyResult[]>(KEY_RESULTS_KEY, (all) => (all ?? []).map((kr) => (kr.id === keyResult.id ? keyResult : kr)));
    },
  });
}
