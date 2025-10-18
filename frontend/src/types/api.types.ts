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

// Pagination types
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationInfo
}

// Base API response types
export interface SuccessResponse<T> extends ApiResponse<T> {
  status: "success"
  data: T
}

export interface ErrorResponse extends ApiResponse {
  status: "error"
  message: string
}
