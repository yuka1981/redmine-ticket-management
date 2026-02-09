import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { DashboardResponse } from '@/types/redmine';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const res = await api.get('dashboard').json<DashboardResponse>();
      return res.dashboard;
    },
  });
}
