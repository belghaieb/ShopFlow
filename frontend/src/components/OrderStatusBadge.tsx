import { OrderStatus } from '@/lib/types';

const labels: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  PROCESSING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

const classes: Record<OrderStatus, string> = {
  PENDING: 'badge-pending',
  PAID: 'badge-paid',
  PROCESSING: 'badge-processing',
  SHIPPED: 'badge-shipped',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
};

export default function OrderStatusBadge({ statut }: { statut: OrderStatus }) {
  return <span className={classes[statut]}>{labels[statut]}</span>;
}
