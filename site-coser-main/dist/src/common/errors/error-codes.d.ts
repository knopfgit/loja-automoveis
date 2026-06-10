import { HttpStatus } from '@nestjs/common';
export interface ErrorDefinition {
    code: string;
    message: string;
    status: HttpStatus;
}
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: {
        readonly code: "VALIDATION_ERROR";
        readonly message: "Dados inválidos.";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly UNAUTHORIZED: {
        readonly code: "UNAUTHORIZED";
        readonly message: "Não autenticado.";
        readonly status: HttpStatus.UNAUTHORIZED;
    };
    readonly FORBIDDEN: {
        readonly code: "FORBIDDEN";
        readonly message: "Acesso negado.";
        readonly status: HttpStatus.FORBIDDEN;
    };
    readonly NOT_FOUND: {
        readonly code: "NOT_FOUND";
        readonly message: "Recurso não encontrado.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly CONFLICT: {
        readonly code: "CONFLICT";
        readonly message: "Conflito com o estado atual do recurso.";
        readonly status: HttpStatus.CONFLICT;
    };
    readonly INTERNAL_ERROR: {
        readonly code: "INTERNAL_ERROR";
        readonly message: "Erro interno do servidor.";
        readonly status: HttpStatus.INTERNAL_SERVER_ERROR;
    };
    readonly RATE_LIMITED: {
        readonly code: "RATE_LIMITED";
        readonly message: "Muitas requisições. Tente novamente mais tarde.";
        readonly status: HttpStatus.TOO_MANY_REQUESTS;
    };
    readonly INVALID_CREDENTIALS: {
        readonly code: "INVALID_CREDENTIALS";
        readonly message: "E-mail ou senha inválidos.";
        readonly status: HttpStatus.UNAUTHORIZED;
    };
    readonly ACCOUNT_LOCKED: {
        readonly code: "ACCOUNT_LOCKED";
        readonly message: "Conta temporariamente bloqueada por excesso de tentativas.";
        readonly status: HttpStatus.FORBIDDEN;
    };
    readonly ACCOUNT_INACTIVE: {
        readonly code: "ACCOUNT_INACTIVE";
        readonly message: "Conta inativa ou bloqueada.";
        readonly status: HttpStatus.FORBIDDEN;
    };
    readonly INVALID_REFRESH_TOKEN: {
        readonly code: "INVALID_REFRESH_TOKEN";
        readonly message: "Refresh token inválido ou expirado.";
        readonly status: HttpStatus.UNAUTHORIZED;
    };
    readonly INVALID_RESET_TOKEN: {
        readonly code: "INVALID_RESET_TOKEN";
        readonly message: "Token de redefinição inválido ou expirado.";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly EMAIL_ALREADY_USED: {
        readonly code: "EMAIL_ALREADY_USED";
        readonly message: "E-mail já cadastrado.";
        readonly status: HttpStatus.CONFLICT;
    };
    readonly VEHICLE_NOT_FOUND: {
        readonly code: "VEHICLE_NOT_FOUND";
        readonly message: "Veículo não encontrado.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly VEHICLE_INVALID_STATUS_TRANSITION: {
        readonly code: "VEHICLE_INVALID_STATUS_TRANSITION";
        readonly message: "Transição de status do veículo não permitida.";
        readonly status: HttpStatus.UNPROCESSABLE_ENTITY;
    };
    readonly CUSTOMER_NOT_FOUND: {
        readonly code: "CUSTOMER_NOT_FOUND";
        readonly message: "Cliente não encontrado.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly EMPLOYEE_NOT_FOUND: {
        readonly code: "EMPLOYEE_NOT_FOUND";
        readonly message: "Funcionário não encontrado.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly PART_NOT_FOUND: {
        readonly code: "PART_NOT_FOUND";
        readonly message: "Peça não encontrada.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly PART_INSUFFICIENT_STOCK: {
        readonly code: "PART_INSUFFICIENT_STOCK";
        readonly message: "Estoque insuficiente para a peça solicitada.";
        readonly status: HttpStatus.UNPROCESSABLE_ENTITY;
    };
    readonly MAINTENANCE_NOT_FOUND: {
        readonly code: "MAINTENANCE_NOT_FOUND";
        readonly message: "Manutenção não encontrada.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly DOCUMENT_NOT_FOUND: {
        readonly code: "DOCUMENT_NOT_FOUND";
        readonly message: "Documento não encontrado.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly SALE_NOT_FOUND: {
        readonly code: "SALE_NOT_FOUND";
        readonly message: "Venda não encontrada.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly RESERVATION_NOT_FOUND: {
        readonly code: "RESERVATION_NOT_FOUND";
        readonly message: "Reserva não encontrada.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly COMMISSION_NOT_FOUND: {
        readonly code: "COMMISSION_NOT_FOUND";
        readonly message: "Comissão não encontrada.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly COMMISSION_RULE_NOT_FOUND: {
        readonly code: "COMMISSION_RULE_NOT_FOUND";
        readonly message: "Regra de comissão não encontrada.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly LEAD_NOT_FOUND: {
        readonly code: "LEAD_NOT_FOUND";
        readonly message: "Lead não encontrado.";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly NO_SELLER_AVAILABLE: {
        readonly code: "NO_SELLER_AVAILABLE";
        readonly message: "Nenhum vendedor disponível para atendimento no momento.";
        readonly status: HttpStatus.SERVICE_UNAVAILABLE;
    };
    readonly UPLOAD_INVALID_TYPE: {
        readonly code: "UPLOAD_INVALID_TYPE";
        readonly message: "Tipo de arquivo não permitido.";
        readonly status: HttpStatus.UNPROCESSABLE_ENTITY;
    };
    readonly UPLOAD_TOO_LARGE: {
        readonly code: "UPLOAD_TOO_LARGE";
        readonly message: "Arquivo excede o tamanho máximo permitido.";
        readonly status: HttpStatus.PAYLOAD_TOO_LARGE;
    };
    readonly STORE_NOT_CONFIGURED: {
        readonly code: "STORE_NOT_CONFIGURED";
        readonly message: "Dados da loja ainda não foram configurados.";
        readonly status: HttpStatus.NOT_FOUND;
    };
};
export type ErrorCode = keyof typeof ERROR_CODES;
