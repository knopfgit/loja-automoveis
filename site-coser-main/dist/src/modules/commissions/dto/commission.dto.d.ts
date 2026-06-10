import { CommissionRuleType } from '@prisma/client';
export declare class CreateCommissionRuleDto {
    name: string;
    type: CommissionRuleType;
    percentage?: number;
    fixedAmount?: number;
    tiers?: {
        min: number;
        max: number | null;
        percentage: number;
    }[];
    isDefault?: boolean;
    description?: string;
}
declare const UpdateCommissionRuleDto_base: import("@nestjs/common").Type<Partial<CreateCommissionRuleDto>>;
export declare class UpdateCommissionRuleDto extends UpdateCommissionRuleDto_base {
}
export declare class AdjustCommissionDto {
    amount: number;
    reason: string;
}
export {};
