import { LeadOrigin, LeadStatus } from '@prisma/client';
export declare class SpecialistContactDto {
    vehicleId?: string;
    customerId?: string;
    name: string;
    phone: string;
    email?: string;
    origin?: LeadOrigin;
    sourcePage?: string;
    message?: string;
}
export declare class UpdateLeadStatusDto {
    status: LeadStatus;
    notes?: string;
}
export declare class AddInteractionDto {
    type: string;
    content?: string;
}
