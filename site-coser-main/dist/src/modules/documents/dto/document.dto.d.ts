import { ChecklistStage, DocumentOwnerType, DocumentStatus } from '@prisma/client';
export declare class CreateDocumentTypeDto {
    code: string;
    name: string;
    ownerType: DocumentOwnerType;
    description?: string;
    hasExpiry?: boolean;
}
declare const UpdateDocumentTypeDto_base: import("@nestjs/common").Type<Partial<CreateDocumentTypeDto>>;
export declare class UpdateDocumentTypeDto extends UpdateDocumentTypeDto_base {
    active?: boolean;
}
export declare class UpsertChecklistDto {
    stage: ChecklistStage;
    documentTypeId: string;
    required?: boolean;
    position?: number;
}
export declare class CreateDocumentDto {
    documentTypeId: string;
    ownerType: DocumentOwnerType;
    vehicleId?: string;
    customerId?: string;
    saleId?: string;
    status?: DocumentStatus;
    issueDate?: string;
    expiryDate?: string;
    notes?: string;
}
export declare class ValidateDocumentDto {
    status: DocumentStatus;
    rejectionReason?: string;
}
export declare class ChecklistStatusQueryDto {
    stage: ChecklistStage;
    vehicleId?: string;
    customerId?: string;
    saleId?: string;
}
export {};
