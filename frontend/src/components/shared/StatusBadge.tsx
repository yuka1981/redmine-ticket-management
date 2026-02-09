import { Badge } from '@/components/ui/badge';
import type { NamedId } from '@/types/redmine';

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Feedback': 'bg-purple-100 text-purple-800',
  'Closed': 'bg-gray-100 text-gray-800',
  'Rejected': 'bg-red-100 text-red-800',
};

export function StatusBadge({ status }: { status: NamedId }) {
  const colorClass = STATUS_COLORS[status.name] ?? 'bg-gray-100 text-gray-800';
  return (
    <Badge variant="outline" className={colorClass}>
      {status.name}
    </Badge>
  );
}
