import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { TrackerBadge } from '@/components/shared/TrackerBadge';
import { Pagination } from '@/components/shared/Pagination';
import { useTickets } from '@/hooks/useTickets';
import { useProjects } from '@/hooks/useProjects';
import { useStatuses } from '@/hooks/useStatuses';
import { usePriorities } from '@/hooks/usePriorities';
import { useTrackers } from '@/hooks/useTrackers';
import { PlusCircle, ArrowUpDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { IssueScope } from '@/types/redmine';

const PER_PAGE = 25;

function SortHeader({ field, children, onToggle }: { field: string; children: React.ReactNode; onToggle: (field: string) => void }) {
  return (
    <TableHead
      className="cursor-pointer select-none"
      onClick={() => onToggle(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  );
}

export default function TicketListPage() {
  const { t } = useTranslation('tickets');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const scope = (searchParams.get('scope') ?? 'assigned_to_me') as IssueScope;
  const page = Number(searchParams.get('page') ?? '1');
  const projectId = searchParams.get('project_id') ?? undefined;
  const rawStatusId = searchParams.get('status_id') ?? 'open';
  const statusId: 'open' | 'closed' | '*' | number =
    rawStatusId === 'open' || rawStatusId === 'closed' || rawStatusId === '*'
      ? rawStatusId
      : Number(rawStatusId);
  const trackerId = searchParams.get('tracker_id') ?? undefined;
  const priorityId = searchParams.get('priority_id') ?? undefined;
  const sort = searchParams.get('sort') ?? 'updated_on:desc';

  const filters = {
    scope,
    project_id: projectId ? Number(projectId) : undefined,
    status_id: statusId,
    tracker_id: trackerId ? Number(trackerId) : undefined,
    priority_id: priorityId ? Number(priorityId) : undefined,
    sort,
    page,
    per_page: PER_PAGE,
  };

  const { data, isLoading } = useTickets(filters);
  const { data: projects } = useProjects();
  const { data: statuses } = useStatuses();
  const { data: priorities } = usePriorities();
  const { data: trackers } = useTrackers();

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const toggleSort = (field: string) => {
    const [currentField, currentDir] = sort.split(':');
    if (currentField === field) {
      updateParam('sort', `${field}:${currentDir === 'asc' ? 'desc' : 'asc'}`);
    } else {
      updateParam('sort', `${field}:asc`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Button onClick={() => navigate('/tickets/new')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('new_ticket')}
        </Button>
      </div>

      <Tabs value={scope} onValueChange={(val) => updateParam('scope', val)}>
        <TabsList>
          <TabsTrigger value="assigned_to_me">{t('scope.assigned_to_me')}</TabsTrigger>
          <TabsTrigger value="created_by_me">{t('scope.created_by_me')}</TabsTrigger>
          <TabsTrigger value="watched">{t('scope.watched')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2 flex-wrap">
        <Select
          value={projectId ?? '__all__'}
          onValueChange={(val) => updateParam('project_id', val === '__all__' ? undefined : val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('filters.all_projects')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('filters.all_projects')}</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(rawStatusId)}
          onValueChange={(val) => updateParam('status_id', val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">{t('filters.status_open')}</SelectItem>
            <SelectItem value="closed">{t('filters.status_closed')}</SelectItem>
            <SelectItem value="*">{t('filters.status_all')}</SelectItem>
            {statuses?.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={trackerId ?? '__all__'}
          onValueChange={(val) => updateParam('tracker_id', val === '__all__' ? undefined : val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.all_trackers')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('filters.all_trackers')}</SelectItem>
            {trackers?.map((tr) => (
              <SelectItem key={tr.id} value={String(tr.id)}>{tr.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priorityId ?? '__all__'}
          onValueChange={(val) => updateParam('priority_id', val === '__all__' ? undefined : val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filters.all_priorities')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('filters.all_priorities')}</SelectItem>
            {priorities?.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data?.tickets && data.tickets.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader field="id" onToggle={toggleSort}>{t('table.id')}</SortHeader>
                  <TableHead>{t('table.tracker')}</TableHead>
                  <SortHeader field="subject" onToggle={toggleSort}>{t('table.subject')}</SortHeader>
                  <SortHeader field="status" onToggle={toggleSort}>{t('table.status')}</SortHeader>
                  <SortHeader field="priority" onToggle={toggleSort}>{t('table.priority')}</SortHeader>
                  <TableHead>{t('table.assigned_to')}</TableHead>
                  <SortHeader field="updated_on" onToggle={toggleSort}>{t('table.updated')}</SortHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tickets.map((issue) => (
                  <TableRow
                    key={issue.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/tickets/${issue.id}`)}
                  >
                    <TableCell className="font-mono text-sm">{issue.id}</TableCell>
                    <TableCell><TrackerBadge tracker={issue.tracker} /></TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {issue.subject}
                    </TableCell>
                    <TableCell><StatusBadge status={issue.status} /></TableCell>
                    <TableCell><PriorityBadge priority={issue.priority} /></TableCell>
                    <TableCell className="text-sm">
                      {issue.assigned_to?.name ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(issue.updated_on), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={page}
            totalCount={data.total_count}
            perPage={PER_PAGE}
            onPageChange={(p) => updateParam('page', String(p))}
          />
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {t('no_tickets')}
        </div>
      )}
    </div>
  );
}
