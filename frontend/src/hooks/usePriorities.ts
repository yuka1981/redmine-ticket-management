import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { RedminePriority } from '@/types/redmine';

export function usePriorities() {
  return useQuery({
    queryKey: queryKeys.priorities.all,
    queryFn: async () => {
      const res = await api.get('priorities').json<{ issue_priorities: RedminePriority[] }>();
      return res.issue_priorities;
    },
    staleTime: 1000 * 60 * 30,
  });
}
