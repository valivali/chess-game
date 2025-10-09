import { z } from "zod"

// Registration form validation schema
export const registerSchema = z
  .object({
    email: z.email("Please enter a valid email address").min(1, "Email is required"),
    username: z
      .string()
      .min(1, "Username is required")
      .min(2, "Username must be at least 2 characters long")
      .max(50, "Username must be less than 50 characters long")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
      .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

// Login form validation schema
export const loginSchema = z.object({
  email: z.email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required")
})

// Type inference from schemas
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
