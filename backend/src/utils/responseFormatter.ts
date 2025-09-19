import { Response } from "express"

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

export class ResponseFormatter {
  /**
   * Send a successful response
   */
  static success<T>(res: Response, data: T, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      status: "success",
      data,
      timestamp: new Date().toISOString()
    }
    res.status(statusCode).json(response)
  }

  /**
   * Send a successful response with a custom message
   */
  static successWithMessage<T>(res: Response, data: T, message: string, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      status: "success",
      data,
      message,
      timestamp: new Date().toISOString()
    }
    res.status(statusCode).json(response)
  }

  /**
   * Send an error response
   */
  static error(res: Response, message: string, statusCode: number = 400): void {
    const response: ApiResponse = {
      status: "error",
      message,
      timestamp: new Date().toISOString()
    }
    res.status(statusCode).json(response)
  }

  /**
   * Send a validation error response
   */
  static validationError(res: Response, errors: Array<{ field: string; message: string }>, statusCode: number = 400): void {
    const response: ApiResponse = {
      status: "error",
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString()
    }
    res.status(statusCode).json(response)
  }

  /**
   * Send a not found response
   */
  static notFound(res: Response, message: string = "Resource not found"): void {
    const response: ApiResponse = {
      status: "error",
      message,
      timestamp: new Date().toISOString()
    }
    res.status(404).json(response)
  }

  /**
   * Send an internal server error response
   */
  static internalError(res: Response, message: string = "Internal server error"): void {
    const response: ApiResponse = {
      status: "error",
      message,
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }

  /**
   * Send a created response
   */
  static created<T>(res: Response, data: T, message: string = "Resource created successfully"): void {
    const response: ApiResponse<T> = {
      status: "success",
      data,
      message,
      timestamp: new Date().toISOString()
    }
    res.status(201).json(response)
  }

  /**
   * Send a no content response
   */
  static noContent(res: Response): void {
    res.status(204).send()
  }
}
