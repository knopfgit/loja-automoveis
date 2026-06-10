export declare const EVENTS: {
    readonly VEHICLE_CREATED: "vehicle.created";
    readonly VEHICLE_UPDATED: "vehicle.updated";
    readonly VEHICLE_STATUS_CHANGED: "vehicle.status_changed";
    readonly VEHICLE_VIEWED: "vehicle.viewed";
    readonly PART_STOCK_LOW: "part.stock_low";
    readonly MAINTENANCE_CREATED: "maintenance.created";
    readonly MAINTENANCE_COMPLETED: "maintenance.completed";
    readonly DOCUMENT_PENDING: "document.pending";
    readonly DOCUMENT_EXPIRING: "document.expiring";
    readonly LEAD_CREATED: "lead.created";
    readonly LEAD_ASSIGNED: "lead.assigned";
    readonly SALE_CREATED: "sale.created";
    readonly SALE_COMPLETED: "sale.completed";
    readonly COMMISSION_GENERATED: "commission.generated";
    readonly COMMISSION_APPROVED: "commission.approved";
    readonly COMMISSION_PAID: "commission.paid";
    readonly DASHBOARD_UPDATED: "dashboard.updated";
};
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export interface RealtimeMessage<T = any> {
    event: EventName | string;
    data: T;
    roles?: ('ADMIN' | 'SELLER' | 'CUSTOMER')[];
    sellerId?: string;
    timestamp: string;
}
