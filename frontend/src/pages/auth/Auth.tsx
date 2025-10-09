import "./Auth.scss"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "../../contexts"
import { Login, Register } from "./"
import type { AuthMode } from "./auth.types"

function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()

  const initialMode = (searchParams.get("mode") as AuthMode) || "login"
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode)

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const newSearchParams = new URLSearchParams()
    if (authMode !== "login") {
      newSearchParams.set("mode", authMode)
    }

    const newSearch = newSearchParams.toString()
    const currentSearch = searchParams.toString()

    if (newSearch !== currentSearch) {
      navigate(`/auth${newSearch ? `?${newSearch}` : ""}`, { replace: true })
    }
  }, [authMode, navigate, searchParams])

  const handleSwitchToLogin = () => setAuthMode("login")
  const handleSwitchToRegister = () => setAuthMode("register")
  const handleSwitchToGuest = () => {
    navigate("/")
  }

  return (
    <div className="welcome__container">
      {authMode === "register" ? (
        <Register onSwitchToLogin={handleSwitchToLogin} onSwitchToGuest={handleSwitchToGuest} />
      ) : (
        <Login onSwitchToRegister={handleSwitchToRegister} onSwitchToGuest={handleSwitchToGuest} />
      )}
    </div>
  )
}

export default Auth
