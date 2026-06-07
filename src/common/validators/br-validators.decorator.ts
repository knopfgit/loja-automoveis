import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import {
  isValidCEP,
  isValidCpfOrCnpj,
  isValidCPF,
  isValidCNPJ,
  isValidBrPhone,
} from './br-document.util';

export function IsCpfOrCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpfOrCnpj',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          typeof value === 'string' && isValidCpfOrCnpj(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ser um CPF ou CNPJ válido.`,
      },
    });
  };
}

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          typeof value === 'string' && isValidCPF(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ser um CPF válido.`,
      },
    });
  };
}

export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCNPJ',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          typeof value === 'string' && isValidCNPJ(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ser um CNPJ válido.`,
      },
    });
  };
}

export function IsCEP(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCEP',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          typeof value === 'string' && isValidCEP(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ser um CEP válido.`,
      },
    });
  };
}

export function IsBrPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBrPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any) =>
          typeof value === 'string' && isValidBrPhone(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property} deve ser um telefone válido.`,
      },
    });
  };
}
