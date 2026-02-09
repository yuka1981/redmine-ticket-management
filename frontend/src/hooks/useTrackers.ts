import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { RedmineTracker } from '@/types/redmine';

export function useTrackers() {
  return useQuery({
    queryKey: queryKeys.trackers.all,
    queryFn: async () => {
      const res = await api.get('trackers').json<{ trackers: RedmineTracker[] }>();
      return res.trackers;
    },
    staleTime: 1000 * 60 * 30,
  });
}
