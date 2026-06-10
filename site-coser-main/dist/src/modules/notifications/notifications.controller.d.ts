import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    list(user: AuthUser, pg: PaginationQueryDto): Promise<import("../../common/dto/paginated-result").PaginatedResult<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: string;
        userId: string;
        title: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        body: string | null;
        readAt: Date | null;
    }>>;
    unread(user: AuthUser): Promise<{
        count: number;
    }>;
    markRead(user: AuthUser, id: string): Promise<{
        id: string;
        status: string;
    }>;
    markAll(user: AuthUser): Promise<{
        success: boolean;
    }>;
}
