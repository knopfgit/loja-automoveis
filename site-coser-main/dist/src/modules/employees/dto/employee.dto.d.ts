import { UserRole } from '@prisma/client';
export declare class CreateEmployeeDto {
    fullName: string;
    cpf: string;
    email: string;
    password: string;
    phone?: string;
    whatsapp?: string;
    position?: string;
    role: UserRole;
    admissionDate?: string;
    pixKey?: string;
    internalNotes?: string;
    defaultCommissionRuleId?: string;
}
declare const UpdateEmployeeDto_base: import("@nestjs/common").Type<Partial<CreateEmployeeDto>>;
export declare class UpdateEmployeeDto extends UpdateEmployeeDto_base {
    active?: boolean;
}
export {};
