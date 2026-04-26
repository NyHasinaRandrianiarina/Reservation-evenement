
import { cn } from "@/lib/utils";

export type DeliveryStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

const statusConfig: Record<DeliveryStatus, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  CONFIRMED: { label: 'Confirmée', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  ASSIGNED: { label: 'Livreur assigné', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  IN_TRANSIT: { label: 'En transit', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  DELIVERED: { label: 'Livrée', className: 'bg-green-100 text-green-800 border-green-200' },
  COMPLETED: { label: 'Clôturée', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Annulée', className: 'bg-red-100 text-red-800 border-red-200' }
};

interface Props {
  status: DeliveryStatus;
  className?: string;
}

export function DeliveryStatusBadge({ status, className }: Props) {
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <span className={cn("px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border", config.className, className)}>
      {config.label}
    </span>
  );
}
