export interface ApiResponse<T = any> {
  status: "success" | "error"
  data?: T
  message?: string
  errors?: Array<{
    field: string
    message: string
  }>
  timestamp: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiRequestConfig {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}
