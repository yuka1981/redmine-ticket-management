import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { TrackerBadge } from '@/components/shared/TrackerBadge';
import { useTicket } from '@/hooks/useTickets';
import { useUpdateTicket } from '@/hooks/useTickets';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteTicket } from '@/hooks/useTickets';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const issueId = Number(id);
  const { t } = useTranslation('tickets');
  const navigate = useNavigate();
  const { data: issue, isLoading } = useTicket(issueId);
  const updateMutation = useUpdateTicket();
  const deleteMutation = useDeleteTicket();
  const [notes, setNotes] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!issue) {
    return <p className="text-muted-foreground">{t('ticket_not_found', { ns: 'common' })}</p>;
  }

  const handleAddNote = async () => {
    if (!notes.trim()) return;
    await updateMutation.mutateAsync({ id: issueId, params: { notes } });
    setNotes('');
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(issueId);
    navigate('/tickets');
  };

  const metadataItems = [
    { label: t('fields.project'), value: issue.project.name },
    { label: t('fields.tracker'), value: <TrackerBadge tracker={issue.tracker} /> },
    { label: t('fields.status'), value: <StatusBadge status={issue.status} /> },
    { label: t('fields.priority'), value: <PriorityBadge priority={issue.priority} /> },
    { label: t('fields.assigned_to'), value: issue.assigned_to?.name ?? '-' },
    { label: t('fields.author'), value: issue.author.name },
    { label: t('fields.start_date'), value: issue.start_date ?? '-' },
    { label: t('fields.due_date'), value: issue.due_date ?? '-' },
    { label: t('fields.done_ratio'), value: `${issue.done_ratio}%` },
    { label: t('fields.estimated_hours'), value: issue.estimated_hours ?? '-' },
    { label: t('fields.spent_hours'), value: issue.spent_hours ?? '-' },
    { label: t('fields.created_on'), value: format(new Date(issue.created_on), 'yyyy-MM-dd HH:mm') },
    { label: t('fields.updated_on'), value: format(new Date(issue.updated_on), 'yyyy-MM-dd HH:mm') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">#{issue.id}</Badge>
            <TrackerBadge tracker={issue.tracker} />
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <h1 className="text-2xl font-bold mt-1">{issue.subject}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/tickets/${issue.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            {t('edit_ticket')}
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('fields.description')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {issue.description || <span className="text-muted-foreground">{t('no_description', { ns: 'common' })}</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('details', { ns: 'common' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {metadataItems.map((item) => (
                <div key={item.label} className="flex justify-between items-start">
                  <dt className="text-sm text-muted-foreground">{item.label}</dt>
                  <dd className="text-sm font-medium text-right">{item.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('journals.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {issue.journals?.map((journal) => (
            <div key={journal.id} className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{journal.user.name}</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(journal.created_on), { addSuffix: true })}
                </span>
              </div>
              {journal.details.map((detail, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {t('journals.changed')} <strong>{detail.name}</strong>{' '}
                  {detail.old_value && <>{t('journals.from')} <em>{detail.old_value}</em> </>}
                  {t('journals.to')} <em>{detail.new_value}</em>
                </p>
              ))}
              {journal.notes && (
                <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                  {journal.notes}
                </p>
              )}
              <Separator />
            </div>
          ))}

          <div className="space-y-2">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('journals.note_placeholder')}
              rows={3}
            />
            <Button
              onClick={handleAddNote}
              disabled={!notes.trim() || updateMutation.isPending}
              size="sm"
            >
              {t('journals.add_note')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_confirm')}</DialogTitle>
            <DialogDescription>{t('delete_warning', { ns: 'common' })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {t('delete', { ns: 'common' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
