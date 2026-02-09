import { Badge } from '@/components/ui/badge';
import type { NamedId } from '@/types/redmine';

const TRACKER_COLORS: Record<string, string> = {
  'Bug': 'bg-red-100 text-red-700',
  'Feature': 'bg-green-100 text-green-700',
  'Support': 'bg-blue-100 text-blue-700',
  'Task': 'bg-purple-100 text-purple-700',
};

export function TrackerBadge({ tracker }: { tracker: NamedId }) {
  const colorClass = TRACKER_COLORS[tracker.name] ?? 'bg-gray-100 text-gray-700';
  return (
    <Badge variant="outline" className={colorClass}>
      {tracker.name}
    </Badge>
  );
}
