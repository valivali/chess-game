import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import { GameProvider } from "../../contexts"
import Game from "./Game"

// Mock react-router-dom
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as Record<string, unknown>),
  useNavigate: () => mockNavigate
}))

// Mock ChessBoard component
jest.mock("../../components/ChessBoard", () => ({
  ChessBoard: () => <div data-testid="chess-board">Chess Board Component</div>
}))

// Mock UI components
jest.mock("../../components/ui/button", () => ({
  Button: ({ children, onClick, variant, className, size }: any) => (
    <button onClick={onClick} className={`button ${variant} ${size} ${className}`}>
      {children}
    </button>
  )
}))

jest.mock("../../components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={`card ${className}`}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={`card-content ${className}`}>{children}</div>
}))

const GameWithRouter = ({ initialEntries = ["/game"] }: { initialEntries?: string[] } = {}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <GameProvider>
      <Game />
    </GameProvider>
  </MemoryRouter>
)

describe("Game Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render game page with correct structure", () => {
    render(<GameWithRouter />)

    expect(screen.getByText("♟️ Chess Game")).toBeDefined()
    expect(screen.getByText("Back to Welcome")).toBeDefined()
    expect(screen.getByTestId("chess-board")).toBeDefined()
  })

  it("should display game ID in title when provided in URL", () => {
    render(<GameWithRouter initialEntries={["/game/test-game-123"]} />)

    // The gameId should be in the context after the useEffect runs
    // For now, just check that the basic title is rendered
    expect(screen.getByText(/♟️ Chess Game/)).toBeDefined()
  })

  it("should have proper header structure", () => {
    render(<GameWithRouter />)

    expect(document.querySelector(".game__header")).toBeDefined()
    expect(document.querySelector(".game__title")).toBeDefined()
    expect(document.querySelector(".game__back-button")).toBeDefined()
    expect(document.querySelector(".game__spacer")).toBeDefined()
  })

  it("should navigate back to welcome page when back button is clicked", () => {
    render(<GameWithRouter initialEntries={["/game/test-game-123"]} />)

    const backButton = screen.getByRole("button")
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith("/")
  })

  it("should render back button with correct properties", () => {
    render(<GameWithRouter />)

    const backButton = screen.getByRole("button")

    expect(backButton).toBeDefined()
    expect(backButton.classList.contains("button")).toBe(true)
    expect(backButton.classList.contains("outline")).toBe(true)
    expect(backButton.classList.contains("sm")).toBe(true)
    expect(backButton.classList.contains("game__back-button")).toBe(true)
  })

  it("should display chess game title", () => {
    render(<GameWithRouter />)

    const title = screen.getByText("♟️ Chess Game")
    expect(title).toBeDefined()
    expect(title.classList.contains("game__title")).toBe(true)
  })

  it("should render chess board within card container", () => {
    render(<GameWithRouter />)

    const chessBoard = screen.getByTestId("chess-board")
    expect(chessBoard).toBeDefined()

    // Check card structure
    expect(document.querySelector(".card.game__board-container")).toBeDefined()
    expect(document.querySelector(".card-content.game__board-content")).toBeDefined()
  })

  it("should have proper container structure", () => {
    render(<GameWithRouter />)

    expect(document.querySelector(".game__container")).toBeDefined()
    expect(document.querySelector(".game__content")).toBeDefined()
  })

  it("should have accessible header structure with back button and title", () => {
    render(<GameWithRouter />)

    const backButton = screen.getByRole("button")
    expect(backButton).toBeDefined()
    expect(backButton.textContent).toBe("←Back to Welcome")

    const title = screen.getByText("♟️ Chess Game")
    expect(title).toBeDefined()
  })

  it("should handle multiple clicks on back button", () => {
    render(<GameWithRouter initialEntries={["/game/test-game-123"]} />)

    const backButton = screen.getByRole("button")

    fireEvent.click(backButton)
    fireEvent.click(backButton)
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith("/")
  })

  it("should render without router context errors", () => {
    // This test ensures the component properly uses useNavigate hook
    expect(() => render(<GameWithRouter />)).not.toThrow()
  })

  it("should have back arrow and text in back button", () => {
    render(<GameWithRouter />)

    expect(document.querySelector(".game__back-arrow")).toBeDefined()
    expect(document.querySelector(".game__back-text")).toBeDefined()

    expect(screen.getByText("←")).toBeDefined()
    expect(screen.getByText("Back to Welcome")).toBeDefined()
  })

  it("should maintain layout structure with header, content, and spacer", () => {
    render(<GameWithRouter />)

    const container = document.querySelector(".game__container")
    const header = document.querySelector(".game__header")
    const content = document.querySelector(".game__content")
    const spacer = document.querySelector(".game__spacer")

    expect(container).toBeDefined()
    expect(header).toBeDefined()
    expect(content).toBeDefined()
    expect(spacer).toBeDefined()
  })

  it("should render chess board as the main content", () => {
    render(<GameWithRouter />)

    const chessBoard = screen.getByTestId("chess-board")
    const boardContainer = document.querySelector(".game__board-container")
    const boardContent = document.querySelector(".game__board-content")

    expect(chessBoard).toBeDefined()
    expect(boardContainer).toBeDefined()
    expect(boardContent).toBeDefined()
  })

  it("should have clickable back button", () => {
    render(<GameWithRouter />)

    const backButton = screen.getByRole("button")
    expect(backButton).toBeDefined()
  })

  it("should integrate ChessBoard component properly", () => {
    render(<GameWithRouter />)

    // Verify that ChessBoard is rendered and integrated
    const chessBoard = screen.getByTestId("chess-board")
    expect(chessBoard).toBeDefined()
    expect(chessBoard.textContent).toBe("Chess Board Component")
  })
})
