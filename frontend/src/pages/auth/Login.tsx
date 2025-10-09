import "./Auth.scss"

import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
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
    mode: "onChange"
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
            <label htmlFor="email" className="auth__label">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                onChange: handleInputChange("email")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <p className="auth__error">{errors.email.message}</p>}
          </div>

          <div className="auth__input-group">
            <label htmlFor="password" className="auth__label">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                onChange: handleInputChange("password")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && <p className="auth__error">{errors.password.message}</p>}
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
