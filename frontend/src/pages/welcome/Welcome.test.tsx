import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"

import { GameProvider } from "../../contexts"
import Welcome from "./Welcome"

// Mock react-router-dom
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as Record<string, unknown>),
  useNavigate: () => mockNavigate
}))

// Mock gameService
jest.mock("../../services/gameService", () => ({
  gameService: {
    createGame: jest.fn()
  }
}))

// Get the mocked function for type safety
const mockCreateGame = jest.mocked(require("../../services/gameService").gameService.createGame)

// Mock UI components
jest.mock("../../components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button onClick={onClick} className={`button ${variant} ${size} ${className}`} disabled={disabled}>
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

jest.mock("../../components/ui/input", () => ({
  Input: ({ placeholder, value, onChange, disabled, maxLength, className }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      className={`input ${className}`}
    />
  )
}))

const WelcomeWithRouter = () => (
  <BrowserRouter>
    <GameProvider>
      <Welcome />
    </GameProvider>
  </BrowserRouter>
)

describe("Welcome Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateGame.mockResolvedValue({
      success: true,
      data: {
        game: {
          id: "test-game-id-123",
          board: [],
          currentPlayer: "white",
          status: "active",
          winner: null,
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z"
        }
      },
      message: "Game created successfully"
    })
  })

  it("should render welcome page with correct content", () => {
    render(<WelcomeWithRouter />)

    expect(screen.getByText("Welcome to Chess Game")).toBeDefined()
    expect(screen.getByText(/Ready to play an exciting game of chess/)).toBeDefined()
    expect(screen.getByText("🎮 Start Game")).toBeDefined()
    expect(screen.getByText("Play anytime, anywhere on any device")).toBeDefined()
    expect(screen.getByText("Enter your username")).toBeDefined()
    expect(screen.getByPlaceholderText("Your username...")).toBeDefined()
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

  it("should disable start game button when username is empty or too short", () => {
    render(<WelcomeWithRouter />)

    const startGameButton = screen.getByText("🎮 Start Game") as HTMLButtonElement
    expect(startGameButton.disabled).toBe(true)
  })

  it("should enable start game button when username has more than 1 character", async () => {
    const user = userEvent.setup()
    render(<WelcomeWithRouter />)

    const usernameInput = screen.getByPlaceholderText("Your username...")
    const startGameButton = screen.getByText("🎮 Start Game") as HTMLButtonElement

    await user.type(usernameInput, "ab")

    expect(startGameButton.disabled).toBe(false)
  })

  it("should create game and navigate when start game button is clicked with valid username", async () => {
    const user = userEvent.setup()
    render(<WelcomeWithRouter />)

    const usernameInput = screen.getByPlaceholderText("Your username...")
    const startGameButton = screen.getByText("🎮 Start Game")

    await user.type(usernameInput, "TestUser")
    fireEvent.click(startGameButton)

    await waitFor(() => {
      expect(mockCreateGame).toHaveBeenCalledWith("TestUser")
      expect(mockNavigate).toHaveBeenCalledWith("/game/test-game-id-123")
    })
  })

  it("should show loading state when creating game", async () => {
    const user = userEvent.setup()
    mockCreateGame.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<WelcomeWithRouter />)

    const usernameInput = screen.getByPlaceholderText("Your username...")
    const startGameButton = screen.getByText("🎮 Start Game")

    await user.type(usernameInput, "TestUser")
    fireEvent.click(startGameButton)

    expect(screen.getByText("Creating Game...")).toBeDefined()
  })

  it("should display error message when game creation fails", async () => {
    const user = userEvent.setup()
    mockCreateGame.mockRejectedValue(new Error("Failed to create game"))

    render(<WelcomeWithRouter />)

    const usernameInput = screen.getByPlaceholderText("Your username...")
    const startGameButton = screen.getByText("🎮 Start Game")

    await user.type(usernameInput, "TestUser")
    fireEvent.click(startGameButton)

    await waitFor(() => {
      expect(screen.getByText("Failed to create game")).toBeDefined()
    })
  })

  it("should clear error when user starts typing", async () => {
    const user = userEvent.setup()
    mockCreateGame.mockRejectedValue(new Error("Failed to create game"))

    render(<WelcomeWithRouter />)

    const usernameInput = screen.getByPlaceholderText("Your username...")
    const startGameButton = screen.getByText("🎮 Start Game")

    // Trigger error
    await user.type(usernameInput, "TestUser")
    fireEvent.click(startGameButton)
    await waitFor(() => {
      expect(screen.getByText("Failed to create game")).toBeDefined()
    })

    // Clear error by typing
    await user.clear(usernameInput)
    await user.type(usernameInput, "NewUser")

    expect(screen.queryByText("Failed to create game")).toBeNull()
  })

  it("should render without router context errors", () => {
    expect(() => render(<WelcomeWithRouter />)).not.toThrow()
  })

  it("should have accessible title structure", () => {
    render(<WelcomeWithRouter />)

    const title = screen.getByRole("heading", { level: 2 })
    expect(title.textContent).toBe("Welcome to Chess Game")
  })

  it("should have username input with proper attributes", () => {
    render(<WelcomeWithRouter />)

    const usernameInput = screen.getByPlaceholderText("Your username...")
    expect(usernameInput.getAttribute("maxLength")).toBe("50")
    expect(usernameInput.classList.contains("input")).toBe(true)
  })
})
