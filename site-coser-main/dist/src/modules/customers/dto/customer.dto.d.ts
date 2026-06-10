import { PersonType } from '@prisma/client';
export declare class AddressDto {
    label?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
}
export declare class CreateCustomerDto {
    fullName: string;
    document: string;
    personType?: PersonType;
    email?: string;
    phone?: string;
    whatsapp?: string;
    birthDate?: string;
    marketingConsent?: boolean;
    cookieConsent?: boolean;
    address?: AddressDto;
}
declare const UpdateCustomerDto_base: import("@nestjs/common").Type<Partial<CreateCustomerDto>>;
export declare class UpdateCustomerDto extends UpdateCustomerDto_base {
}
export declare class UpdateMyProfileDto {
    fullName?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    marketingConsent?: boolean;
}
export {};
