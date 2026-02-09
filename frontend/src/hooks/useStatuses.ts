import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { RedmineStatus } from '@/types/redmine';

export function useStatuses() {
  return useQuery({
    queryKey: queryKeys.statuses.all,
    queryFn: async () => {
      const res = await api.get('statuses').json<{ issue_statuses: RedmineStatus[] }>();
      return res.issue_statuses;
    },
    staleTime: 1000 * 60 * 30,
  });
}
