import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiEnvelope, ApiErrorBody, ApiMeta, PaginatedResult } from '../types';
import { tokenStore } from './tokenStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type AuthPayload = { accessToken: string; refreshToken: string; user?: unknown };

export class ApiClientError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(error: ApiErrorBody, status?: number) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
    this.status = status;
    this.details = error.details;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.success === false ? error.response.data.error.code : undefined;
    const canRefresh = status === 401 && code !== 'INVALID_REFRESH_TOKEN' && original && !original._retry;
    const refreshToken = tokenStore.getRefreshToken();

    if (canRefresh && refreshToken) {
      original._retry = true;
      try {
        const response = await axios.post<ApiEnvelope<AuthPayload>>(`${API_URL}/auth/refresh`, { refreshToken });
        if (response.data.success) {
          tokenStore.setTokens({
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          });
          original.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return api(original);
        }
      } catch {
        tokenStore.clearTokens();
      }
    }

    if (error.response?.data?.success === false) {
      throw new ApiClientError(error.response.data.error, status);
    }

    throw error;
  },
);

export async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await request;
  if (!response.data.success) {
    throw new ApiClientError(response.data.error);
  }
  return response.data.data;
}

export async function unwrapList<T>(request: Promise<{ data: ApiEnvelope<T[]> }>): Promise<PaginatedResult<T>> {
  const response = await request;
  if (!response.data.success) {
    throw new ApiClientError(response.data.error);
  }
  return {
    items: response.data.data,
    meta: response.data.meta ?? ({} as ApiMeta),
  };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.code === 'FORBIDDEN') return 'Voce nao tem permissao para executar esta acao.';
    if (error.code === 'ACCOUNT_LOCKED') return 'Conta bloqueada. Use a recuperacao de senha.';
    if (error.code === 'RATE_LIMITED') return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    return error.message;
  }
  return 'Nao foi possivel concluir a operacao agora.';
}
