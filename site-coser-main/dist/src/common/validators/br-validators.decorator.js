"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCpfOrCnpj = IsCpfOrCnpj;
exports.IsCPF = IsCPF;
exports.IsCNPJ = IsCNPJ;
exports.IsCEP = IsCEP;
exports.IsBrPhone = IsBrPhone;
const class_validator_1 = require("class-validator");
const br_document_util_1 = require("./br-document.util");
function IsCpfOrCnpj(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCpfOrCnpj',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate: (value) => typeof value === 'string' && (0, br_document_util_1.isValidCpfOrCnpj)(value),
                defaultMessage: (args) => `${args.property} deve ser um CPF ou CNPJ válido.`,
            },
        });
    };
}
function IsCPF(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCPF',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate: (value) => typeof value === 'string' && (0, br_document_util_1.isValidCPF)(value),
                defaultMessage: (args) => `${args.property} deve ser um CPF válido.`,
            },
        });
    };
}
function IsCNPJ(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCNPJ',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate: (value) => typeof value === 'string' && (0, br_document_util_1.isValidCNPJ)(value),
                defaultMessage: (args) => `${args.property} deve ser um CNPJ válido.`,
            },
        });
    };
}
function IsCEP(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCEP',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate: (value) => typeof value === 'string' && (0, br_document_util_1.isValidCEP)(value),
                defaultMessage: (args) => `${args.property} deve ser um CEP válido.`,
            },
        });
    };
}
function IsBrPhone(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isBrPhone',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate: (value) => typeof value === 'string' && (0, br_document_util_1.isValidBrPhone)(value),
                defaultMessage: (args) => `${args.property} deve ser um telefone válido.`,
            },
        });
    };
}
//# sourceMappingURL=br-validators.decorator.js.map