import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { TicketForm } from '@/components/shared/TicketForm';
import { useTicket, useUpdateTicket } from '@/hooks/useTickets';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateIssueParams } from '@/types/redmine';

export default function TicketEditPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const issueId = Number(id);
  const navigate = useNavigate();
  const { data: issue, isLoading } = useTicket(issueId);
  const mutation = useUpdateTicket();

  if (isLoading) {
    return <Skeleton className="h-96 max-w-3xl mx-auto" />;
  }

  if (!issue) {
    return <p className="text-muted-foreground">{t('ticket_not_found')}</p>;
  }

  const handleSubmit = async (data: CreateIssueParams) => {
    await mutation.mutateAsync({ id: issueId, params: data });
    navigate(`/tickets/${issueId}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <TicketForm
        initialData={issue}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        onCancel={() => navigate(`/tickets/${issueId}`)}
      />
    </div>
  );
}
