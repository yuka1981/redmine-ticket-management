import { useNavigate } from 'react-router';
import { TicketForm } from '@/components/shared/TicketForm';
import { useCreateTicket } from '@/hooks/useTickets';
import type { CreateIssueParams } from '@/types/redmine';

export default function TicketCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateTicket();

  const handleSubmit = async (data: CreateIssueParams) => {
    const result = await mutation.mutateAsync(data);
    navigate(`/tickets/${result.ticket.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <TicketForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        onCancel={() => navigate('/tickets')}
      />
    </div>
  );
}
