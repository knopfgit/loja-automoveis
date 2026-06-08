import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, unwrapList } from './api';
import type { PaginatedResult } from '../types';

type Params = Record<string, unknown>;

export function list<T = Record<string, unknown>>(endpoint: string, params?: Params) {
  return unwrapList<T>(api.get(endpoint, { params }));
}

export function item<T = Record<string, unknown>>(endpoint: string) {
  return unwrap<T>(api.get(endpoint));
}

export function useList<T = Record<string, unknown>>(
  key: unknown[],
  endpoint: string,
  params?: Params,
  enabled = true,
) {
  return useQuery<PaginatedResult<T>>({
    queryKey: key,
    queryFn: () => list<T>(endpoint, params),
    enabled,
  });
}

export function useItem<T = Record<string, unknown>>(key: unknown[], endpoint: string, enabled = true) {
  return useQuery<T>({ queryKey: key, queryFn: () => item<T>(endpoint), enabled });
}

/** Returns a function that invalidates one or more query keys (by prefix). */
export function useInvalidate() {
  const queryClient = useQueryClient();
  return (...keys: unknown[][]) => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

type MutationOptions<TVars, TData> = {
  onSuccess?: (data: TData, vars: TVars) => void;
  invalidate?: unknown[][];
};

/** Generic mutation helper with built-in invalidation. */
export function useApiMutation<TVars = void, TData = unknown>(
  mutationFn: (vars: TVars) => Promise<TData>,
  options: MutationOptions<TVars, TData> = {},
) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn,
    onSuccess: (data, vars) => {
      if (options.invalidate) invalidate(...options.invalidate);
      options.onSuccess?.(data, vars);
    },
  });
}
