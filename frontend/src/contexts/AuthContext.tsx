import type { ReactNode } from "react"
import React, { createContext, useContext, useEffect, useReducer } from "react"
import { match } from "ts-pattern"

import type { AuthState, AuthTokens, LoginRequest, RegisterRequest } from "../pages/auth/auth.types"
import { authService } from "../services/authService"
import type { User } from "../types/user.types"

export interface IAuthContext extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  clearError: () => void
  refreshTokens: () => Promise<void>
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; tokens: AuthTokens } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_TOKENS"; payload: AuthTokens }

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  return match(action)
    .with({ type: "AUTH_START" }, () => ({
      ...state,
      isLoading: true,
      error: null
    }))
    .with({ type: "AUTH_SUCCESS" }, (action) => ({
      ...state,
      user: action.payload.user,
      tokens: action.payload.tokens,
      isAuthenticated: true,
      isLoading: false,
      error: null
    }))
    .with({ type: "AUTH_FAILURE" }, (action) => ({
      ...state,
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: action.payload
    }))
    .with({ type: "LOGOUT" }, () => ({
      ...state,
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    }))
    .with({ type: "CLEAR_ERROR" }, () => ({
      ...state,
      error: null
    }))
    .with({ type: "SET_LOADING" }, (action) => ({
      ...state,
      isLoading: action.payload
    }))
    .with({ type: "UPDATE_TOKENS" }, (action) => ({
      ...state,
      tokens: action.payload
    }))
    .exhaustive()
}

const AuthContext = createContext<IAuthContext | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        dispatch({ type: "SET_LOADING", payload: true })

        try {
          const user = await authService.getProfile()
          const accessToken = authService.getAccessToken()
          const refreshToken = authService.getRefreshToken()

          if (accessToken && refreshToken) {
            dispatch({
              type: "AUTH_SUCCESS",
              payload: {
                user,
                tokens: {
                  accessToken,
                  refreshToken,
                  expiresIn: 1800 // Default value, will be updated on refresh
                }
              }
            })
          }
        } catch (error) {
          console.error("Failed to initialize authentication:", error)
          authService.logout()
          dispatch({ type: "LOGOUT" })
        }
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" })

    try {
      const authResponse = await authService.login(credentials)
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: authResponse.user,
          tokens: authResponse.tokens
        }
      })
    } catch (error) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: error instanceof Error ? error.message : "Login failed"
      })
      throw error
    }
  }

  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" })

    try {
      const authResponse = await authService.register(userData)
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: authResponse.user,
          tokens: authResponse.tokens
        }
      })
    } catch (error) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: error instanceof Error ? error.message : "Registration failed"
      })
      throw error
    }
  }

  const logout = (): void => {
    authService.logout()
    dispatch({ type: "LOGOUT" })
  }

  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const refreshTokens = async (): Promise<void> => {
    try {
      const tokens = await authService.refreshTokens()
      dispatch({ type: "UPDATE_TOKENS", payload: tokens })
    } catch (error) {
      logout()
      throw error
    }
  }

  const contextValue: IAuthContext = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshTokens
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
