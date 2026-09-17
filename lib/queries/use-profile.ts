'use client';

import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { authUserFromProfileRow, profileToUpdate } from '@/lib/mappers/profiles';
import type { AuthUser } from '@/lib/types/domain';

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: async ({ profileId, fields }: { profileId: string; fields: { name: string; title: string; contactInfo: string } }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .update(profileToUpdate(fields))
        .eq('id', profileId)
        .select()
        .single();
      if (error) throw error;
      return authUserFromProfileRow(data) satisfies AuthUser;
    },
  });
}
