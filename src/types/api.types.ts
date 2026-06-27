export interface ApiResponse<T> {
  data: T
  meta: {
    trace_id: string
    current_page?: number
    per_page?: number
    total?: number
    last_page?: number
  }
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    trace_id: string
  }
}

export interface ApiError {
  code: string
  message: string
  trace_id: string
  status: number
  data?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    trace_id: string
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}
