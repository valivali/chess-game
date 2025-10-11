import "./Auth.scss"

import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { InputWithError } from "../../components/ui/input"
import { useAuth } from "../../contexts"
import { type LoginFormData, loginSchema } from "./validation.schemas"

interface LoginProps {
  onSwitchToRegister: () => void
  onSwitchToGuest: () => void
}

function Login({ onSwitchToRegister, onSwitchToGuest }: LoginProps) {
  const { login, isLoading, error, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur"
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  const handleInputChange = (field: keyof LoginFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (errors[field]) {
      clearErrors(field)
    }

    if (error) {
      clearError()
    }

    return event
  }

  return (
    <Card className="auth__card">
      <CardHeader className="auth__header">
        <CardTitle className="auth__title">Welcome Back</CardTitle>
        <CardDescription className="auth__description">Sign in to your account to continue playing chess</CardDescription>
      </CardHeader>
      <CardContent className="auth__content">
        <form onSubmit={handleSubmit(onSubmit)} className="auth__form">
          <div className="auth__input-group">
            <InputWithError
              id="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register("email", {
                onChange: handleInputChange("email")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="auth__input-group">
            <InputWithError
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password", {
                onChange: handleInputChange("password")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="auth__error-banner">{error}</div>}

          <Button type="submit" variant="gradient" size="xl" className="auth__submit-button" disabled={isLoading}>
            {isLoading ? "Signing In..." : "🔐 Sign In"}
          </Button>
        </form>

        <div className="auth__divider">
          <span>or</span>
        </div>

        <div className="auth__actions">
          <Button variant="outline" size="lg" onClick={onSwitchToRegister} className="auth__switch-button" disabled={isLoading}>
            Create New Account
          </Button>

          <Button variant="ghost" size="sm" onClick={onSwitchToGuest} className="auth__guest-button" disabled={isLoading}>
            Continue as Guest
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Login
