import { Request, Response, NextFunction } from "express"
import { RequestValidationError } from "./validation"
import { ResponseFormatter } from "@/utils/response-formatter"

interface AppError extends Error {
  statusCode?: number
  status?: string
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Handle validation errors
  if (err instanceof RequestValidationError) {
    ResponseFormatter.validationError(res, err.errors, err.statusCode)
    return
  }

  // Handle other known errors
  const statusCode = err.statusCode || 500

  if (statusCode === 404) {
    ResponseFormatter.notFound(res, err.message)
    return
  }

  if (statusCode >= 400 && statusCode < 500) {
    ResponseFormatter.error(res, err.message, statusCode)
    return
  }

  // Handle internal server errors
  const message = statusCode === 500 ? "Internal server error" : err.message
  ResponseFormatter.internalError(res, message)
}
