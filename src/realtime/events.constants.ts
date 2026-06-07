/**
 * Canonical real-time event names. Emitted via RealtimeService and delivered
 * over WebSocket and SSE. Also used as @nestjs/event-emitter channels for
 * in-process listeners (notifications, dashboard recompute, etc.).
 */
export const EVENTS = {
  VEHICLE_CREATED: 'vehicle.created',
  VEHICLE_UPDATED: 'vehicle.updated',
  VEHICLE_STATUS_CHANGED: 'vehicle.status_changed',
  VEHICLE_VIEWED: 'vehicle.viewed',
  PART_STOCK_LOW: 'part.stock_low',
  MAINTENANCE_CREATED: 'maintenance.created',
  MAINTENANCE_COMPLETED: 'maintenance.completed',
  DOCUMENT_PENDING: 'document.pending',
  DOCUMENT_EXPIRING: 'document.expiring',
  LEAD_CREATED: 'lead.created',
  LEAD_ASSIGNED: 'lead.assigned',
  SALE_CREATED: 'sale.created',
  SALE_COMPLETED: 'sale.completed',
  COMMISSION_GENERATED: 'commission.generated',
  COMMISSION_APPROVED: 'commission.approved',
  COMMISSION_PAID: 'commission.paid',
  DASHBOARD_UPDATED: 'dashboard.updated',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export interface RealtimeMessage<T = any> {
  event: EventName | string;
  data: T;
  /** Optional targeting: only deliver to these roles. */
  roles?: ('ADMIN' | 'SELLER' | 'CUSTOMER')[];
  /** Optional targeting: only deliver to a specific seller (employee id). */
  sellerId?: string;
  timestamp: string;
}
