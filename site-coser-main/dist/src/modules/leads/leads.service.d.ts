import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginatedResult } from '../../common/dto/paginated-result';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { AddInteractionDto, SpecialistContactDto, UpdateLeadStatusDto } from './dto/lead.dto';
export declare class LeadsService {
    private readonly prisma;
    private readonly config;
    private readonly audit;
    private readonly realtime;
    private readonly notifications;
    constructor(prisma: PrismaService, config: ConfigService, audit: AuditService, realtime: RealtimeService, notifications: NotificationsService);
    private pickSeller;
    private buildWhatsappUrl;
    specialistContact(dto: SpecialistContactDto): Promise<{
        leadId: string;
        assignedSeller: {
            id: string;
            name: string;
        } | null;
        whatsappUrl: string | null;
        status: import(".prisma/client").$Enums.LeadStatus;
    }>;
    findAll(pg: PaginationQueryDto, filters: {
        status?: string;
        sellerId?: string;
    }): Promise<PaginatedResult<{
        vehicle: {
            publicCode: string;
            brand: string;
            model: string;
        } | null;
        assignedSeller: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.LeadStatus;
        origin: import(".prisma/client").$Enums.LeadOrigin;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        vehicleId: string | null;
        notes: string | null;
        phone: string | null;
        email: string | null;
        customerId: string | null;
        sourcePage: string | null;
        initialMessage: string | null;
        whatsappUrl: string | null;
        firstContactAt: Date | null;
        convertedAt: Date | null;
        assignedSellerId: string | null;
    }>>;
    findOne(id: string, user?: {
        role: string;
        employeeId?: string | null;
    }): Promise<{
        vehicle: {
            id: string;
            publicCode: string;
            slug: string;
            plate: string | null;
            renavam: string | null;
            chassis: string | null;
            status: import(".prisma/client").$Enums.VehicleStatus;
            brand: string;
            model: string;
            version: string | null;
            manufactureYear: number;
            modelYear: number;
            engineNumber: string | null;
            category: string | null;
            bodyType: string | null;
            color: string | null;
            fuel: import(".prisma/client").$Enums.FuelType | null;
            transmission: import(".prisma/client").$Enums.Transmission | null;
            doors: number | null;
            mileage: number | null;
            seats: number | null;
            condition: import(".prisma/client").$Enums.VehicleCondition;
            origin: import(".prisma/client").$Enums.VehicleOrigin;
            entryDate: Date;
            archiveReason: string | null;
            purchasePrice: Prisma.Decimal | null;
            suggestedPrice: Prisma.Decimal | null;
            announcedPrice: Prisma.Decimal | null;
            minPrice: Prisma.Decimal | null;
            soldPrice: Prisma.Decimal | null;
            soldAt: Date | null;
            featured: boolean;
            availableForAd: boolean;
            internalNotes: string | null;
            publicDescription: string | null;
            viewCount: number;
            favoriteCount: number;
            contactCount: number;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        interactions: {
            id: string;
            createdAt: Date;
            type: string;
            content: string | null;
            leadId: string;
            authorId: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.LeadStatus;
        origin: import(".prisma/client").$Enums.LeadOrigin;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        vehicleId: string | null;
        notes: string | null;
        phone: string | null;
        email: string | null;
        customerId: string | null;
        sourcePage: string | null;
        initialMessage: string | null;
        whatsappUrl: string | null;
        firstContactAt: Date | null;
        convertedAt: Date | null;
        assignedSellerId: string | null;
    }>;
    updateStatus(id: string, dto: UpdateLeadStatusDto, actorId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.LeadStatus;
        origin: import(".prisma/client").$Enums.LeadOrigin;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        vehicleId: string | null;
        notes: string | null;
        phone: string | null;
        email: string | null;
        customerId: string | null;
        sourcePage: string | null;
        initialMessage: string | null;
        whatsappUrl: string | null;
        firstContactAt: Date | null;
        convertedAt: Date | null;
        assignedSellerId: string | null;
    }>;
    addInteraction(id: string, dto: AddInteractionDto, actorId?: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        content: string | null;
        leadId: string;
        authorId: string | null;
    }>;
}
