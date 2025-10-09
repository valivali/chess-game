import { Request, Response, NextFunction } from "express"
import { z, ZodError, ZodIssue } from "zod"

export interface ValidationError {
  field: string
  message: string
}

export class RequestValidationError extends Error {
  public readonly statusCode = 400
  public readonly errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    super("Request validation failed")
    this.name = "RequestValidationError"
    this.errors = errors
  }
}

/**
 * Middleware factory for validating request body
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body)
      req.body = validatedData
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message
        }))
        next(new RequestValidationError(validationErrors))
      } else {
        next(error)
      }
    }
  }
}

/**
 * Middleware factory for validating request parameters
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params)
      req.params = validatedData as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map((err: ZodIssue) => ({
          field: `params.${err.path.join(".")}`,
          message: err.message
        }))
        next(new RequestValidationError(validationErrors))
      } else {
        next(error)
      }
    }
  }
}

/**
 * Middleware factory for validating query parameters
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query)
      req.query = validatedData as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map((err: ZodIssue) => ({
          field: `query.${err.path.join(".")}`,
          message: err.message
        }))
        next(new RequestValidationError(validationErrors))
      } else {
        next(error)
      }
    }
  }
}

/**
 * Alias for validateBody - commonly used for request validation
 */
export const validateRequest = validateBody
