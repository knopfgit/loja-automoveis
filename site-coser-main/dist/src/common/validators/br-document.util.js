"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyDigits = void 0;
exports.isValidCPF = isValidCPF;
exports.isValidCNPJ = isValidCNPJ;
exports.isValidCpfOrCnpj = isValidCpfOrCnpj;
exports.isValidCEP = isValidCEP;
exports.isValidBrPhone = isValidBrPhone;
const onlyDigits = (value) => (value || '').replace(/\D/g, '');
exports.onlyDigits = onlyDigits;
function isValidCPF(value) {
    const cpf = (0, exports.onlyDigits)(value);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;
    const calc = (factor) => {
        let total = 0;
        for (let i = 0; i < factor - 1; i++) {
            total += parseInt(cpf[i], 10) * (factor - i);
        }
        const rest = (total * 10) % 11;
        return rest === 10 ? 0 : rest;
    };
    return (calc(10) === parseInt(cpf[9], 10) && calc(11) === parseInt(cpf[10], 10));
}
function isValidCNPJ(value) {
    const cnpj = (0, exports.onlyDigits)(value);
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj))
        return false;
    const calc = (length) => {
        const numbers = cnpj.substring(0, length);
        let sum = 0;
        let pos = length - 7;
        for (let i = length; i >= 1; i--) {
            sum += parseInt(numbers[length - i], 10) * pos--;
            if (pos < 2)
                pos = 9;
        }
        const result = sum % 11;
        return result < 2 ? 0 : 11 - result;
    };
    const d1 = calc(12);
    const d2 = calc(13);
    return d1 === parseInt(cnpj[12], 10) && d2 === parseInt(cnpj[13], 10);
}
function isValidCpfOrCnpj(value) {
    const digits = (0, exports.onlyDigits)(value);
    if (digits.length === 11)
        return isValidCPF(digits);
    if (digits.length === 14)
        return isValidCNPJ(digits);
    return false;
}
function isValidCEP(value) {
    return (0, exports.onlyDigits)(value).length === 8;
}
function isValidBrPhone(value) {
    const digits = (0, exports.onlyDigits)(value);
    return [10, 11, 12, 13].includes(digits.length);
}
//# sourceMappingURL=br-document.util.js.map