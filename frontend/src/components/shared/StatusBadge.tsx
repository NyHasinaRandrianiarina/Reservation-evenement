import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import type { EventStatus } from '@/types/event';
import { cn } from '@/lib/utils';

const statusVariantMap: Record<EventStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-primary/10 text-primary',
  sold_out: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-destructive/10 text-destructive',
  past: 'bg-muted text-muted-foreground',
};

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium border-0 px-2.5 py-0.5',
        statusVariantMap[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
