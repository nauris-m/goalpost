'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { periodFromRow, periodsToInsert } from '@/lib/mappers/periods';
import { generatePeriods } from '@/lib/domain/period-util';
import type { Period } from '@/lib/types/domain';

const PERIODS_KEY = ['periods'] as const;

export function usePeriodsQuery(initialData: Period[]) {
  return useQuery({
    queryKey: PERIODS_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('periods').select('*').order('start_date', { ascending: true });
      if (error) throw error;
      return data.map(periodFromRow);
    },
    initialData,
  });
}

export function useAddGeneratedPeriodsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      year,
      splitCount,
      existingNames,
    }: {
      teamId: string;
      year: number;
      splitCount: number;
      existingNames: readonly string[];
    }) => {
      const existing = new Set(existingNames);
      const toInsert = generatePeriods(year, splitCount).filter((p) => !existing.has(p.name));
      if (toInsert.length === 0) return [];

      const supabase = createClient();
      const { data, error } = await supabase.from('periods').insert(periodsToInsert(teamId, toInsert)).select();
      if (error) throw error;
      return data.map(periodFromRow);
    },
    onSuccess: (newPeriods) => {
      if (newPeriods.length === 0) return;
      queryClient.setQueryData<Period[]>(PERIODS_KEY, (all) => [...(all ?? []), ...newPeriods]);
    },
  });
}
