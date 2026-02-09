import type { IssueFilters } from '@/types/redmine';

export const queryKeys = {
  issues: {
    all: ['issues'] as const,
    list: (filters: IssueFilters) => ['issues', 'list', filters] as const,
    detail: (id: number) => ['issues', 'detail', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: () => ['projects', 'list'] as const,
    detail: (id: number) => ['projects', 'detail', id] as const,
  },
  statuses: {
    all: ['statuses'] as const,
  },
  priorities: {
    all: ['priorities'] as const,
  },
  trackers: {
    all: ['trackers'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => ['dashboard', 'stats'] as const,
  },
  users: {
    current: ['users', 'current'] as const,
  },
};
