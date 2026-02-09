import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { RedmineProject, ProjectsResponse } from '@/types/redmine';

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: async () => {
      const res = await api.get('projects').json<ProjectsResponse>();
      return res.projects;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export type { RedmineProject };
