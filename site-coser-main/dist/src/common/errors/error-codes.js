"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = void 0;
const common_1 = require("@nestjs/common");
exports.ERROR_CODES = {
    VALIDATION_ERROR: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos.',
        status: common_1.HttpStatus.BAD_REQUEST,
    },
    UNAUTHORIZED: {
        code: 'UNAUTHORIZED',
        message: 'Não autenticado.',
        status: common_1.HttpStatus.UNAUTHORIZED,
    },
    FORBIDDEN: {
        code: 'FORBIDDEN',
        message: 'Acesso negado.',
        status: common_1.HttpStatus.FORBIDDEN,
    },
    NOT_FOUND: {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    CONFLICT: {
        code: 'CONFLICT',
        message: 'Conflito com o estado atual do recurso.',
        status: common_1.HttpStatus.CONFLICT,
    },
    INTERNAL_ERROR: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor.',
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
    },
    RATE_LIMITED: {
        code: 'RATE_LIMITED',
        message: 'Muitas requisições. Tente novamente mais tarde.',
        status: common_1.HttpStatus.TOO_MANY_REQUESTS,
    },
    INVALID_CREDENTIALS: {
        code: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha inválidos.',
        status: common_1.HttpStatus.UNAUTHORIZED,
    },
    ACCOUNT_LOCKED: {
        code: 'ACCOUNT_LOCKED',
        message: 'Conta temporariamente bloqueada por excesso de tentativas.',
        status: common_1.HttpStatus.FORBIDDEN,
    },
    ACCOUNT_INACTIVE: {
        code: 'ACCOUNT_INACTIVE',
        message: 'Conta inativa ou bloqueada.',
        status: common_1.HttpStatus.FORBIDDEN,
    },
    INVALID_REFRESH_TOKEN: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token inválido ou expirado.',
        status: common_1.HttpStatus.UNAUTHORIZED,
    },
    INVALID_RESET_TOKEN: {
        code: 'INVALID_RESET_TOKEN',
        message: 'Token de redefinição inválido ou expirado.',
        status: common_1.HttpStatus.BAD_REQUEST,
    },
    EMAIL_ALREADY_USED: {
        code: 'EMAIL_ALREADY_USED',
        message: 'E-mail já cadastrado.',
        status: common_1.HttpStatus.CONFLICT,
    },
    VEHICLE_NOT_FOUND: {
        code: 'VEHICLE_NOT_FOUND',
        message: 'Veículo não encontrado.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    VEHICLE_INVALID_STATUS_TRANSITION: {
        code: 'VEHICLE_INVALID_STATUS_TRANSITION',
        message: 'Transição de status do veículo não permitida.',
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    },
    CUSTOMER_NOT_FOUND: {
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Cliente não encontrado.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    EMPLOYEE_NOT_FOUND: {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Funcionário não encontrado.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    PART_NOT_FOUND: {
        code: 'PART_NOT_FOUND',
        message: 'Peça não encontrada.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    PART_INSUFFICIENT_STOCK: {
        code: 'PART_INSUFFICIENT_STOCK',
        message: 'Estoque insuficiente para a peça solicitada.',
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    },
    MAINTENANCE_NOT_FOUND: {
        code: 'MAINTENANCE_NOT_FOUND',
        message: 'Manutenção não encontrada.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    DOCUMENT_NOT_FOUND: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Documento não encontrado.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    SALE_NOT_FOUND: {
        code: 'SALE_NOT_FOUND',
        message: 'Venda não encontrada.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    RESERVATION_NOT_FOUND: {
        code: 'RESERVATION_NOT_FOUND',
        message: 'Reserva não encontrada.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    COMMISSION_NOT_FOUND: {
        code: 'COMMISSION_NOT_FOUND',
        message: 'Comissão não encontrada.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    COMMISSION_RULE_NOT_FOUND: {
        code: 'COMMISSION_RULE_NOT_FOUND',
        message: 'Regra de comissão não encontrada.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    LEAD_NOT_FOUND: {
        code: 'LEAD_NOT_FOUND',
        message: 'Lead não encontrado.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
    NO_SELLER_AVAILABLE: {
        code: 'NO_SELLER_AVAILABLE',
        message: 'Nenhum vendedor disponível para atendimento no momento.',
        status: common_1.HttpStatus.SERVICE_UNAVAILABLE,
    },
    UPLOAD_INVALID_TYPE: {
        code: 'UPLOAD_INVALID_TYPE',
        message: 'Tipo de arquivo não permitido.',
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    },
    UPLOAD_TOO_LARGE: {
        code: 'UPLOAD_TOO_LARGE',
        message: 'Arquivo excede o tamanho máximo permitido.',
        status: common_1.HttpStatus.PAYLOAD_TOO_LARGE,
    },
    STORE_NOT_CONFIGURED: {
        code: 'STORE_NOT_CONFIGURED',
        message: 'Dados da loja ainda não foram configurados.',
        status: common_1.HttpStatus.NOT_FOUND,
    },
};
//# sourceMappingURL=error-codes.js.map