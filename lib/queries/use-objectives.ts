'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { objectiveFromRow, objectiveToInsert } from '@/lib/mappers/objectives';
import type { Objective } from '@/lib/types/domain';

const OBJECTIVES_KEY = ['objectives'] as const;

export function useObjectivesQuery(initialData: Objective[]) {
  return useQuery({
    queryKey: OBJECTIVES_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('objectives').select('*').order('title', { ascending: true });
      if (error) throw error;
      return data.map(objectiveFromRow);
    },
    initialData,
  });
}

export function useAddObjectiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      periodId,
      ownerId,
      title,
      description,
    }: {
      periodId: string;
      ownerId: string | null;
      title: string;
      description: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('objectives').insert(objectiveToInsert(periodId, ownerId, title, description)).select().single();
      if (error) throw error;
      return objectiveFromRow(data);
    },
    onSuccess: (objective) => {
      queryClient.setQueryData<Objective[]>(OBJECTIVES_KEY, (all) => [...(all ?? []), objective]);
    },
  });
}

export function useDeleteObjectiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (objectiveId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('objectives').delete().eq('id', objectiveId);
      if (error) throw error;
      return objectiveId;
    },
    onSuccess: (objectiveId) => {
      queryClient.setQueryData<Objective[]>(OBJECTIVES_KEY, (all) => (all ?? []).filter((o) => o.id !== objectiveId));
    },
  });
}
