import { Badge } from '@/components/ui/badge';
import type { NamedId } from '@/types/redmine';

const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'bg-slate-100 text-slate-700',
  'Normal': 'bg-blue-100 text-blue-700',
  'High': 'bg-orange-100 text-orange-700',
  'Urgent': 'bg-red-100 text-red-700',
  'Immediate': 'bg-red-200 text-red-900',
};

export function PriorityBadge({ priority }: { priority: NamedId }) {
  const colorClass = PRIORITY_COLORS[priority.name] ?? 'bg-gray-100 text-gray-700';
  return (
    <Badge variant="outline" className={colorClass}>
      {priority.name}
    </Badge>
  );
}
