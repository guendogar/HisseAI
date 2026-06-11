import { ApiError } from '../types';

export class AppError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'AppError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Ağ bağlantısı hatası. Lütfen tekrar deneyin.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'İstek zaman aşımına uğradı.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class AuthError extends Error {
  constructor(message = 'Oturum süresi doldu. Lütfen tekrar giriş yapın.') {
    super(message);
    this.name = 'AuthError';
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof AppError) return error.message;
  if (error instanceof NetworkError) return error.message;
  if (error instanceof TimeoutError) return error.message;
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Beklenmeyen bir hata oluştu.';
};
