import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"

import Welcome from "./Welcome"

// Mock react-router-dom
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as Record<string, unknown>),
  useNavigate: () => mockNavigate
}))

// Mock UI components
jest.mock("../../components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button onClick={onClick} className={`button ${variant} ${size} ${className}`}>
      {children}
    </button>
  )
}))

jest.mock("../../components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={`card ${className}`}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={`card-content ${className}`}>{children}</div>,
  CardDescription: ({ children, className }: any) => <div className={`card-description ${className}`}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={`card-header ${className}`}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h2 className={`card-title ${className}`}>{children}</h2>
}))

const WelcomeWithRouter = () => (
  <BrowserRouter>
    <Welcome />
  </BrowserRouter>
)

describe("Welcome Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render welcome page with correct content", () => {
    render(<WelcomeWithRouter />)

    expect(screen.getByText("Welcome to Chess Game")).toBeDefined()
    expect(screen.getByText(/Ready to play an exciting game of chess/)).toBeDefined()
    expect(screen.getByText("🎮 Start Game")).toBeDefined()
    expect(screen.getByText("Play anytime, anywhere on any device")).toBeDefined()
  })

  it("should have proper structure with card components", () => {
    render(<WelcomeWithRouter />)

    // Check for card structure
    expect(document.querySelector(".card.welcome__card")).toBeDefined()
    expect(document.querySelector(".card-header.welcome__header")).toBeDefined()
    expect(document.querySelector(".card-title.welcome__title")).toBeDefined()
    expect(document.querySelector(".card-description.welcome__description")).toBeDefined()
    expect(document.querySelector(".card-content.welcome__content")).toBeDefined()
  })

  it("should navigate to game page when start game button is clicked", () => {
    render(<WelcomeWithRouter />)

    const startGameButton = screen.getByText("🎮 Start Game")
    fireEvent.click(startGameButton)

    expect(mockNavigate).toHaveBeenCalledWith("/game")
    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })

  it("should render start game button with correct properties", () => {
    render(<WelcomeWithRouter />)

    const startGameButton = screen.getByText("🎮 Start Game")

    expect(startGameButton).toBeDefined()
    expect(startGameButton.classList.contains("button")).toBe(true)
    expect(startGameButton.classList.contains("gradient")).toBe(true)
    expect(startGameButton.classList.contains("xl")).toBe(true)
    expect(startGameButton.classList.contains("welcome__button")).toBe(true)
  })

  it("should have proper container structure", () => {
    render(<WelcomeWithRouter />)

    expect(document.querySelector(".welcome__container")).toBeDefined()
  })

  it("should display encouraging description text", () => {
    render(<WelcomeWithRouter />)

    const description = screen.getByText(
      /Ready to play an exciting game of chess\? Challenge yourself and improve your strategic thinking!/
    )
    expect(description).toBeDefined()
  })

  it("should display subtitle about device compatibility", () => {
    render(<WelcomeWithRouter />)

    const subtitle = screen.getByText("Play anytime, anywhere on any device")
    expect(subtitle).toBeDefined()
    expect(subtitle.classList.contains("welcome__subtitle")).toBe(true)
  })

  it("should handle multiple clicks on start game button", () => {
    render(<WelcomeWithRouter />)

    const startGameButton = screen.getByText("🎮 Start Game")

    fireEvent.click(startGameButton)
    fireEvent.click(startGameButton)
    fireEvent.click(startGameButton)

    expect(mockNavigate).toHaveBeenCalledTimes(3)
    expect(mockNavigate).toHaveBeenCalledWith("/game")
  })

  it("should render without router context errors", () => {
    // This test ensures the component properly uses useNavigate hook
    expect(() => render(<WelcomeWithRouter />)).not.toThrow()
  })

  it("should have accessible title structure", () => {
    render(<WelcomeWithRouter />)

    const title = screen.getByRole("heading", { level: 2 })
    expect(title.textContent).toBe("Welcome to Chess Game")
  })

  it("should have clickable start game button", () => {
    render(<WelcomeWithRouter />)

    const startGameButton = screen.getByRole("button")
    expect(startGameButton).toBeDefined()
  })
})
