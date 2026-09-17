'use client';

import { useQuery } from '@tanstack/react-query';

export interface RandomUserProfile {
  readonly firstName: string;
  readonly initial: string;
  readonly photoUrl: string;
}

interface RandomUserApiResult {
  readonly name: { readonly first: string };
  readonly picture: { readonly large: string };
}

interface RandomUserApiResponse {
  readonly results: readonly RandomUserApiResult[];
}

const RESULT_COUNT = 15;
const API_URL = `https://randomuser.me/api/?results=${RESULT_COUNT}&seed=goalpost-app&nat=us,gb,ca,au,nz`;

function capitalize(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

/** Realistic member avatars and first names, sourced live from randomuser.me instead of being hand-mocked. */
export function useRandomUserProfiles(): readonly RandomUserProfile[] {
  const { data } = useQuery({
    queryKey: ['random-user-profiles'],
    queryFn: async (): Promise<RandomUserApiResponse> => {
      const res = await fetch(API_URL);
      return res.json();
    },
    staleTime: Infinity,
  });

  if (!data) return [];
  return data.results.map((result) => ({
    firstName: capitalize(result.name.first),
    initial: result.name.first.charAt(0).toUpperCase(),
    photoUrl: result.picture.large,
  }));
}
