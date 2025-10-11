import "./Auth.scss"

import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { InputWithError } from "../../components/ui/input"
import { useAuth } from "../../contexts"
import { type RegisterFormData, registerSchema } from "./validation.schemas"

interface RegisterProps {
  onSwitchToLogin: () => void
  onSwitchToGuest: () => void
}

function Register({ onSwitchToLogin, onSwitchToGuest }: RegisterProps) {
  const { register: authRegister, isLoading, error, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur"
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister(data)
    } catch (err) {
      console.error("Registration failed:", err)
    }
  }

  const handleInputChange = (field: keyof RegisterFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <CardTitle className="auth__title">Create Account</CardTitle>
        <CardDescription className="auth__description">Join our chess community and start playing today</CardDescription>
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
              id="username"
              type="text"
              label="Username"
              placeholder="Choose a username"
              error={errors.username?.message}
              {...register("username", {
                onChange: handleInputChange("username")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="username"
              maxLength={50}
            />
          </div>

          <div className="auth__input-group">
            <InputWithError
              id="password"
              type="password"
              label="Password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              {...register("password", {
                onChange: handleInputChange("password")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="auth__input-group">
            <InputWithError
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                onChange: handleInputChange("confirmPassword")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="auth__error-banner">{error}</div>}

          <Button type="submit" variant="gradient" size="xl" className="auth__submit-button" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "🚀 Create Account"}
          </Button>
        </form>

        <div className="auth__divider">
          <span>or</span>
        </div>

        <div className="auth__actions">
          <Button variant="outline" size="lg" onClick={onSwitchToLogin} className="auth__switch-button" disabled={isLoading}>
            Already Have Account? Sign In
          </Button>

          <Button variant="ghost" size="sm" onClick={onSwitchToGuest} className="auth__guest-button" disabled={isLoading}>
            Continue as Guest
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Register
