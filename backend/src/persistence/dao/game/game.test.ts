import { GameDao } from './game'
import { GameModel } from '@/models/game'
import { GAME_STATUS, PIECE_COLOR } from '@/types/game-types'

// Mock mongoose
jest.mock('@/models/game')

describe('GameDao', () => {
  let gameDao: GameDao
  const mockGameModel = GameModel as jest.Mocked<typeof GameModel>

  beforeEach(() => {
    gameDao = new GameDao()
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new game', async () => {
      // Arrange
      const gameData = {
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLOR.WHITE,
        status: GAME_STATUS.ACTIVE,
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockSavedGame = {
        _id: '507f1f77bcf86cd799439011',
        ...gameData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockSave = jest.fn().mockResolvedValue(mockSavedGame)
      const mockGameInstance = {
        save: mockSave
      }

      ;(mockGameModel as any).mockImplementation(() => mockGameInstance)

      // Act
      const subject = await gameDao.create(gameData)

      // Assert
      expect(subject.id).toBe('507f1f77bcf86cd799439011')
      expect(subject.currentPlayer).toBe(PIECE_COLOR.WHITE)
      expect(subject.status).toBe(GAME_STATUS.ACTIVE)
      expect(mockSave).toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('should return a game when found', async () => {
      // Arrange
      const gameId = '507f1f77bcf86cd799439011'
      const mockGame = {
        _id: gameId,
        board: Array(8)
          .fill(null)
          .map(() => Array(8).fill(null)),
        currentPlayer: PIECE_COLOR.WHITE,
        status: GAME_STATUS.ACTIVE,
        winner: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockGameModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockGame)
      })

      // Act
      const subject = await gameDao.findById(gameId)

      // Assert
      expect(subject).not.toBeNull()
      expect(subject?.id).toBe(gameId)
      expect(mockGameModel.findById).toHaveBeenCalledWith(gameId)
    })

    it('should return null when game not found', async () => {
      // Arrange
      const gameId = 'nonexistent'

      mockGameModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      // Act
      const subject = await gameDao.findById(gameId)

      // Assert
      expect(subject).toBeNull()
    })
  })

  describe('build', () => {
    it('should create a GameDao instance', () => {
      // Act
      const subject = GameDao.build()

      // Assert
      expect(subject).toBeInstanceOf(GameDao)
    })
  })
})
