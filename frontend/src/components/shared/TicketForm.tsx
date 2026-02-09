import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { useStatuses } from '@/hooks/useStatuses';
import { usePriorities } from '@/hooks/usePriorities';
import { useTrackers } from '@/hooks/useTrackers';
import type { CreateIssueParams, RedmineIssue } from '@/types/redmine';

const ticketSchema = z.object({
  project_id: z.number({ error: 'Project is required' }),
  tracker_id: z.number({ error: 'Tracker is required' }),
  status_id: z.number().optional(),
  priority_id: z.number({ error: 'Priority is required' }),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  assigned_to_id: z.number().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().positive().optional(),
  done_ratio: z.number().min(0).max(100).optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  initialData?: RedmineIssue;
  onSubmit: (data: CreateIssueParams) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function TicketForm({ initialData, onSubmit, isSubmitting, onCancel }: TicketFormProps) {
  const { t } = useTranslation('tickets');
  const { t: tCommon } = useTranslation();
  const { data: projects } = useProjects();
  const { data: statuses } = useStatuses();
  const { data: priorities } = usePriorities();
  const { data: trackers } = useTrackers();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: initialData
      ? {
          project_id: initialData.project.id,
          tracker_id: initialData.tracker.id,
          status_id: initialData.status.id,
          priority_id: initialData.priority.id,
          subject: initialData.subject,
          description: initialData.description ?? '',
          assigned_to_id: initialData.assigned_to?.id,
          start_date: initialData.start_date ?? '',
          due_date: initialData.due_date ?? '',
          estimated_hours: initialData.estimated_hours ?? undefined,
          done_ratio: initialData.done_ratio,
        }
      : {},
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const projectId = watch('project_id');
  const trackerId = watch('tracker_id');
  const statusId = watch('status_id');
  const priorityId = watch('priority_id');

  const handleFormSubmit = (data: TicketFormData) => {
    onSubmit(data as CreateIssueParams);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? t('edit_ticket') : t('new_ticket')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('fields.project')}</Label>
              <Select
                value={projectId ? String(projectId) : ''}
                onValueChange={(val) => setValue('project_id', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.select_project')} />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project_id && (
                <p className="text-sm text-destructive">{errors.project_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('fields.tracker')}</Label>
              <Select
                value={trackerId ? String(trackerId) : ''}
                onValueChange={(val) => setValue('tracker_id', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.select_tracker')} />
                </SelectTrigger>
                <SelectContent>
                  {trackers?.map((tr) => (
                    <SelectItem key={tr.id} value={String(tr.id)}>{tr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tracker_id && (
                <p className="text-sm text-destructive">{errors.tracker_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('fields.subject')}</Label>
            <Input {...register('subject')} placeholder={t('form.subject_placeholder')} />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('fields.description')}</Label>
            <Textarea
              {...register('description')}
              placeholder={t('form.description_placeholder')}
              rows={6}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {initialData && (
              <div className="space-y-2">
                <Label>{t('fields.status')}</Label>
                <Select
                  value={statusId ? String(statusId) : ''}
                  onValueChange={(val) => setValue('status_id', Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.select_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('fields.priority')}</Label>
              <Select
                value={priorityId ? String(priorityId) : ''}
                onValueChange={(val) => setValue('priority_id', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.select_priority')} />
                </SelectTrigger>
                <SelectContent>
                  {priorities?.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority_id && (
                <p className="text-sm text-destructive">{errors.priority_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('fields.start_date')}</Label>
              <Input type="date" {...register('start_date')} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.due_date')}</Label>
              <Input type="date" {...register('due_date')} />
            </div>
            <div className="space-y-2">
              <Label>{t('fields.estimated_hours')}</Label>
              <Input
                type="number"
                step="0.5"
                {...register('estimated_hours', { valueAsNumber: true })}
              />
            </div>
          </div>

          {initialData && (
            <div className="space-y-2">
              <Label>{t('fields.done_ratio')}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="10"
                {...register('done_ratio', { valueAsNumber: true })}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tCommon('loading') : tCommon('save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
