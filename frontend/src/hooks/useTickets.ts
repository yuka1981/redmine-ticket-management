import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type {
  IssueFilters,
  TicketsResponse,
  TicketResponse,
  RedmineIssue,
  CreateIssueParams,
  UpdateIssueParams,
} from '@/types/redmine';

export function useTickets(filters: IssueFilters) {
  return useQuery({
    queryKey: queryKeys.issues.list(filters),
    queryFn: () =>
      api
        .get('tickets', { searchParams: buildSearchParams(filters) })
        .json<TicketsResponse>(),
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: queryKeys.issues.detail(id),
    queryFn: async () => {
      const res = await api.get(`tickets/${id}`).json<TicketResponse>();
      return res.ticket;
    },
    enabled: id > 0,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateIssueParams) =>
      api.post('tickets', { json: { ticket: params } }).json<TicketResponse>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success('Ticket created successfully');
    },
    onError: () => {
      toast.error('Failed to create ticket');
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: number; params: UpdateIssueParams }) =>
      api.put(`tickets/${id}`, { json: { ticket: params } }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success('Ticket updated successfully');
    },
    onError: () => {
      toast.error('Failed to update ticket');
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`tickets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success('Ticket deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete ticket');
    },
  });
}

function buildSearchParams(filters: IssueFilters): Record<string, string> {
  const params: Record<string, string> = {};
  params.scope = filters.scope;
  if (filters.project_id) params.project_id = String(filters.project_id);
  if (filters.status_id !== undefined) params.status_id = String(filters.status_id);
  if (filters.tracker_id) params.tracker_id = String(filters.tracker_id);
  if (filters.priority_id) params.priority_id = String(filters.priority_id);
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = String(filters.page);
  if (filters.per_page) params.per_page = String(filters.per_page);
  return params;
}

// Re-export for convenience in pages that import from this module
export type { RedmineIssue };
