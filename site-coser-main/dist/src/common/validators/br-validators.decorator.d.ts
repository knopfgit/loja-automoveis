import { ValidationOptions } from 'class-validator';
export declare function IsCpfOrCnpj(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
export declare function IsCPF(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
export declare function IsCNPJ(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
export declare function IsCEP(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
export declare function IsBrPhone(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
