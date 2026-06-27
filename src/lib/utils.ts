import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AxiosError } from 'axios'
import type { ApiError, ApiErrorResponse } from '@/types/api.types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return {
      code: axiosError.response?.data?.error?.code ?? 'NETWORK_ERROR',
      message:
        axiosError.response?.data?.error?.message ??
        'Error de conexión con el servidor',
      trace_id: axiosError.response?.data?.error?.trace_id ?? '',
      status: axiosError.response?.status ?? 0,
      data: axiosError.response?.data as Record<string, unknown> | undefined,
    }
  }

  if (error instanceof Error) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
      trace_id: '',
      status: 0,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ha ocurrido un error inesperado',
    trace_id: '',
    status: 0,
  }
}

export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const axiosError = error as AxiosError
    return axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNABORTED'
  }
  return false
}
