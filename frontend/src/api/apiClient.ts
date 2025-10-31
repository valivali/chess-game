import { config } from "../config"
import { authenticatedFetch, tokenManager } from "./auth.api"

export interface IApiClient {
  get<T = any>(endpoint: string): Promise<{ data: T }>
  post<T = any>(endpoint: string, body?: any): Promise<{ data: T }>
  put<T = any>(endpoint: string, body?: any): Promise<{ data: T }>
  delete<T = any>(endpoint: string): Promise<{ data: T }>
}

class ApiClient implements IApiClient {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = config.api.baseUrl
  }

  async get<T = any>(endpoint: string): Promise<{ data: T }> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await this.makeRequest(url, {
      method: "GET"
    })

    const data = await this.handleResponse<T>(response)
    return { data }
  }

  async post<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await this.makeRequest(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await this.handleResponse<T>(response)
    return { data }
  }

  async put<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await this.makeRequest(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await this.handleResponse<T>(response)
    return { data }
  }

  async delete<T = any>(endpoint: string): Promise<{ data: T }> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await this.makeRequest(url, {
      method: "DELETE"
    })

    const data = await this.handleResponse<T>(response)
    return { data }
  }

  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const isAuthRequired = !url.includes("/public") && !url.includes("/lichess")

    if (isAuthRequired && tokenManager.isAuthenticated()) {
      return await authenticatedFetch(url, options)
    } else {
      return await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers
        }
      })
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        console.error("Failed to parse error response:", response)
      }

      const error = new Error(errorMessage) as any
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }

    // Handle empty responses (like DELETE operations)
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T
    }

    try {
      return await response.json()
    } catch {
      throw new Error("Failed to parse response JSON")
    }
  }
}

export const apiClient = new ApiClient()
