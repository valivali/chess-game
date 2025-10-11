import { Request, Response, NextFunction } from "express"

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`
  })
}
