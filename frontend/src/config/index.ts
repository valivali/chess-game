/**
 * Application configuration loaded from environment variables
 */
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3001/api"
  }
} as const

export type AppConfig = typeof config
