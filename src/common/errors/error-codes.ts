/**
 * Canonical, documented application error codes.
 * The `message` is a sensible default (pt-BR); callers may override it.
 * The `status` is the HTTP status returned to the client.
 */
import { HttpStatus } from '@nestjs/common';

export interface ErrorDefinition {
  code: string;
  message: string;
  status: HttpStatus;
}

export const ERROR_CODES = {
  // Generic
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Dados inválidos.',
    status: HttpStatus.BAD_REQUEST,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Não autenticado.',
    status: HttpStatus.UNAUTHORIZED,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Acesso negado.',
    status: HttpStatus.FORBIDDEN,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Recurso não encontrado.',
    status: HttpStatus.NOT_FOUND,
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'Conflito com o estado atual do recurso.',
    status: HttpStatus.CONFLICT,
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Muitas requisições. Tente novamente mais tarde.',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },

  // Auth
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'E-mail ou senha inválidos.',
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'Conta temporariamente bloqueada por excesso de tentativas.',
    status: HttpStatus.FORBIDDEN,
  },
  ACCOUNT_INACTIVE: {
    code: 'ACCOUNT_INACTIVE',
    message: 'Conta inativa ou bloqueada.',
    status: HttpStatus.FORBIDDEN,
  },
  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    message: 'Refresh token inválido ou expirado.',
    status: HttpStatus.UNAUTHORIZED,
  },
  INVALID_RESET_TOKEN: {
    code: 'INVALID_RESET_TOKEN',
    message: 'Token de redefinição inválido ou expirado.',
    status: HttpStatus.BAD_REQUEST,
  },
  EMAIL_ALREADY_USED: {
    code: 'EMAIL_ALREADY_USED',
    message: 'E-mail já cadastrado.',
    status: HttpStatus.CONFLICT,
  },

  // Domain
  VEHICLE_NOT_FOUND: {
    code: 'VEHICLE_NOT_FOUND',
    message: 'Veículo não encontrado.',
    status: HttpStatus.NOT_FOUND,
  },
  VEHICLE_INVALID_STATUS_TRANSITION: {
    code: 'VEHICLE_INVALID_STATUS_TRANSITION',
    message: 'Transição de status do veículo não permitida.',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },
  CUSTOMER_NOT_FOUND: {
    code: 'CUSTOMER_NOT_FOUND',
    message: 'Cliente não encontrado.',
    status: HttpStatus.NOT_FOUND,
  },
  EMPLOYEE_NOT_FOUND: {
    code: 'EMPLOYEE_NOT_FOUND',
    message: 'Funcionário não encontrado.',
    status: HttpStatus.NOT_FOUND,
  },
  PART_NOT_FOUND: {
    code: 'PART_NOT_FOUND',
    message: 'Peça não encontrada.',
    status: HttpStatus.NOT_FOUND,
  },
  PART_INSUFFICIENT_STOCK: {
    code: 'PART_INSUFFICIENT_STOCK',
    message: 'Estoque insuficiente para a peça solicitada.',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },
  MAINTENANCE_NOT_FOUND: {
    code: 'MAINTENANCE_NOT_FOUND',
    message: 'Manutenção não encontrada.',
    status: HttpStatus.NOT_FOUND,
  },
  DOCUMENT_NOT_FOUND: {
    code: 'DOCUMENT_NOT_FOUND',
    message: 'Documento não encontrado.',
    status: HttpStatus.NOT_FOUND,
  },
  SALE_NOT_FOUND: {
    code: 'SALE_NOT_FOUND',
    message: 'Venda não encontrada.',
    status: HttpStatus.NOT_FOUND,
  },
  RESERVATION_NOT_FOUND: {
    code: 'RESERVATION_NOT_FOUND',
    message: 'Reserva não encontrada.',
    status: HttpStatus.NOT_FOUND,
  },
  COMMISSION_NOT_FOUND: {
    code: 'COMMISSION_NOT_FOUND',
    message: 'Comissão não encontrada.',
    status: HttpStatus.NOT_FOUND,
  },
  COMMISSION_RULE_NOT_FOUND: {
    code: 'COMMISSION_RULE_NOT_FOUND',
    message: 'Regra de comissão não encontrada.',
    status: HttpStatus.NOT_FOUND,
  },
  LEAD_NOT_FOUND: {
    code: 'LEAD_NOT_FOUND',
    message: 'Lead não encontrado.',
    status: HttpStatus.NOT_FOUND,
  },
  NO_SELLER_AVAILABLE: {
    code: 'NO_SELLER_AVAILABLE',
    message: 'Nenhum vendedor disponível para atendimento no momento.',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  },
  UPLOAD_INVALID_TYPE: {
    code: 'UPLOAD_INVALID_TYPE',
    message: 'Tipo de arquivo não permitido.',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },
  UPLOAD_TOO_LARGE: {
    code: 'UPLOAD_TOO_LARGE',
    message: 'Arquivo excede o tamanho máximo permitido.',
    status: HttpStatus.PAYLOAD_TOO_LARGE,
  },
  STORE_NOT_CONFIGURED: {
    code: 'STORE_NOT_CONFIGURED',
    message: 'Dados da loja ainda não foram configurados.',
    status: HttpStatus.NOT_FOUND,
  },
} as const satisfies Record<string, ErrorDefinition>;

export type ErrorCode = keyof typeof ERROR_CODES;
