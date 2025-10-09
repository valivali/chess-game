import { GameService } from "./GameService"
import { GameDaoInterface } from "@/dao/gameDao.interface"
import { PIECE_COLOR, GAME_STATUS } from "@/types/gameTypes"

// Mock uuid module
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("test-game-id")
}))

// Mock dependencies
const mockGameDao: jest.Mocked<GameDaoInterface> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn()
}

const mockIdGenerator = {
  generateId: jest.fn().mockReturnValue("test-game-id")
}

describe("GameService", () => {
  let gameService: GameService

  beforeEach(() => {
    gameService = new GameService(mockGameDao, mockIdGenerator)
    jest.clearAllMocks()
  })

  describe("createGame", () => {
    it("should create a new game with initial board state", async () => {
      // Arrange
      const mockBoard = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null))
      const expectedGame = {
        id: "test-game-id",
        board: mockBoard,
        currentPlayer: PIECE_COLOR.WHITE,
        status: GAME_STATUS.ACTIVE,
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockGameDao.create.mockResolvedValue(expectedGame)

      // Act
      const subject = await gameService.createGame("TestPlayer")

      // Assert
      expect(mockGameDao.create).toHaveBeenCalledWith({
        board: expect.any(Array),
        currentPlayer: PIECE_COLOR.WHITE,
        status: GAME_STATUS.ACTIVE,
        winner: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
      expect(subject).toEqual(expectedGame)
      expect(subject.board).toHaveLength(8)
      expect(subject.board[0]).toHaveLength(8)
    })
  })

  describe("getGame", () => {
    it("should retrieve a game by id", async () => {
      // Arrange
      const gameId = "test-game-id"
      const expectedGame = {
        id: gameId,
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLOR.WHITE,
        status: GAME_STATUS.ACTIVE,
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockGameDao.findById.mockResolvedValue(expectedGame)

      // Act
      const subject = await gameService.getGame(gameId)

      // Assert
      expect(mockGameDao.findById).toHaveBeenCalledWith(gameId)
      expect(subject).toEqual(expectedGame)
    })

    it("should return null when game not found", async () => {
      // Arrange
      const gameId = "nonexistent-game"
      mockGameDao.findById.mockResolvedValue(null)

      // Act
      const subject = await gameService.getGame(gameId)

      // Assert
      expect(subject).toBeNull()
    })
  })

  describe("updateGame", () => {
    it("should update an existing game", async () => {
      // Arrange
      const game = {
        id: "test-game-id",
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLOR.BLACK,
        status: GAME_STATUS.ACTIVE,
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockGameDao.update.mockResolvedValue(game)

      // Act
      const subject = await gameService.updateGame(game)

      // Assert
      expect(mockGameDao.update).toHaveBeenCalledWith(game.id, {
        board: game.board,
        currentPlayer: game.currentPlayer,
        status: game.status,
        winner: game.winner,
        updatedAt: expect.any(Date)
      })
      expect(subject).toEqual(game)
    })

    it("should throw error when game not found", async () => {
      // Arrange
      const game = {
        id: "nonexistent-game",
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLOR.BLACK,
        status: GAME_STATUS.ACTIVE,
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockGameDao.update.mockResolvedValue(null)

      // Act & Assert
      await expect(gameService.updateGame(game)).rejects.toThrow("Game not found")
    })
  })

  describe("deleteGame", () => {
    it("should delete a game", async () => {
      // Arrange
      const gameId = "test-game-id"
      mockGameDao.delete.mockResolvedValue(true)

      // Act
      await gameService.deleteGame(gameId)

      // Assert
      expect(mockGameDao.delete).toHaveBeenCalledWith(gameId)
    })

    it("should throw error when game not found", async () => {
      // Arrange
      const gameId = "nonexistent-game"
      mockGameDao.delete.mockResolvedValue(false)

      // Act & Assert
      await expect(gameService.deleteGame(gameId)).rejects.toThrow("Game not found")
    })
  })

  describe("build", () => {
    it("should create a GameService instance", () => {
      // Act
      const subject = GameService.build()

      // Assert
      expect(subject).toBeInstanceOf(GameService)
    })
  })
})
