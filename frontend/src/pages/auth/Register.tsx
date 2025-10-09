import "./Auth.scss"

import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
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
    mode: "onChange"
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
            <label htmlFor="username" className="auth__label">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              {...register("username", {
                onChange: handleInputChange("username")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="username"
              maxLength={50}
            />
            {errors.username && <p className="auth__error">{errors.username.message}</p>}
          </div>

          <div className="auth__input-group">
            <label htmlFor="password" className="auth__label">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              {...register("password", {
                onChange: handleInputChange("password")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && <p className="auth__error">{errors.password.message}</p>}
          </div>

          <div className="auth__input-group">
            <label htmlFor="confirmPassword" className="auth__label">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                onChange: handleInputChange("confirmPassword")
              })}
              className="auth__input"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="auth__error">{errors.confirmPassword.message}</p>}
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
