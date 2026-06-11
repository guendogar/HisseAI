import { Config } from '../../config';
import { ApiResponse, ApiError } from '../../types';
import { AppError, NetworkError, TimeoutError, AuthError } from '../../utils';

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

let authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = Config.API_TIMEOUT ?? 15000,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const mergedHeaders: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...headers,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };

  try {
    const response = await fetch(`${Config.API_BASE_URL}${path}`, {
      method,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.status === 401) {
      throw new AuthError();
    }

    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !json.success) {
      throw new AppError({
        code: 'API_ERROR',
        message: json.message ?? 'API hatası',
        statusCode: response.status,
        details: json,
      } as ApiError);
    }

    return json.data;
  } catch (error) {
    clearTimeout(timer);

    if (error instanceof AuthError || error instanceof AppError) throw error;
    if ((error as Error).name === 'AbortError') throw new TimeoutError();
    throw new NetworkError();
  }
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};
