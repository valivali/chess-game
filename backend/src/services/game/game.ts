import {
  Game,
  GameStatusInfo,
  GameListItem,
  GameHistoryItem,
  PaginatedResponse,
  PIECE_COLOR,
  GAME_STATUS,
  PIECE_TYPE,
  PieceType
} from "@/types/game-types"
import { GameDao, GameDaoInterface } from "@/persistence"
import { GameServiceInterface } from "./game.interface"
import { v4 as uuidv4 } from "uuid"

interface IdGeneratorInterface {
  generateId(): string
}

class IdGenerator implements IdGeneratorInterface {
  generateId(): string {
    return uuidv4()
  }

  static build(): IdGenerator {
    return new IdGenerator()
  }
}

export class GameService implements GameServiceInterface {
  constructor(
    private readonly gameDao: GameDaoInterface,
    private readonly idGenerator: IdGeneratorInterface
  ) {}

  async createGame(playerName?: string, userId?: string): Promise<Game> {
    const board = this.initializeChessBoard()

    const gameData: any = {
      board,
      currentPlayer: PIECE_COLOR.WHITE,
      status: GAME_STATUS.ACTIVE,
      winner: null,
      whitePlayerId: userId || this.idGenerator.generateId(), // Use userId if authenticated, otherwise generate guest ID
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Only add optional fields if they have values
    if (playerName) {
      gameData.playerName = playerName
    }

    return await this.gameDao.create(gameData)
  }

  async getGame(gameId: string): Promise<Game | null> {
    return await this.gameDao.findById(gameId)
  }

  async updateGame(game: Game): Promise<Game> {
    const updatedGame = await this.gameDao.update(game.id, {
      board: game.board,
      currentPlayer: game.currentPlayer,
      status: game.status,
      winner: game.winner,
      updatedAt: new Date()
    })

    if (!updatedGame) {
      throw new Error("Game not found")
    }

    return updatedGame
  }

  async resetGame(gameId: string): Promise<Game> {
    const board = this.initializeChessBoard()

    const updatedGame = await this.gameDao.update(gameId, {
      board,
      currentPlayer: PIECE_COLOR.WHITE,
      status: GAME_STATUS.ACTIVE,
      winner: null,
      updatedAt: new Date()
    })

    if (!updatedGame) {
      throw new Error("Game not found")
    }

    return updatedGame
  }

  async deleteGame(gameId: string): Promise<void> {
    const deleted = await this.gameDao.delete(gameId)
    if (!deleted) {
      throw new Error("Game not found")
    }
  }

  async getGameStatus(gameId: string): Promise<GameStatusInfo | null> {
    const game = await this.gameDao.findById(gameId)
    if (!game) {
      return null
    }

    return {
      id: game.id,
      status: game.status,
      currentPlayer: game.currentPlayer,
      winner: game.winner,
      isInCheck: false, // Simplified for now
      availableMoves: [] // Simplified for now
    }
  }

  async getActiveGames(userId: string, page: number, limit: number): Promise<PaginatedResponse<GameListItem>> {
    // For now, return mock data - in a real implementation, this would query the database
    // filtering for games where the user is a participant and the game is still active
    const mockActiveGames: GameListItem[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        opponentName: "ChessMaster2024",
        moveCount: 15,
        currentPlayer: PIECE_COLOR.WHITE,
        status: GAME_STATUS.ACTIVE,
        lastMove: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        userColor: PIECE_COLOR.WHITE,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        opponentName: "KnightRider",
        moveCount: 8,
        currentPlayer: PIECE_COLOR.BLACK,
        status: GAME_STATUS.ACTIVE,
        lastMove: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        userColor: PIECE_COLOR.BLACK,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ]

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = mockActiveGames.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: mockActiveGames.length,
        totalPages: Math.ceil(mockActiveGames.length / limit)
      }
    }
  }

  async getGameHistory(userId: string, page: number, limit: number): Promise<PaginatedResponse<GameHistoryItem>> {
    // For now, return mock data - in a real implementation, this would query the database
    // filtering for completed games where the user was a participant
    const mockGameHistory: GameHistoryItem[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        opponentName: "GrandMaster99",
        result: "win",
        endReason: "checkmate",
        moveCount: 42,
        duration: 35, // 35 minutes
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        userColor: PIECE_COLOR.WHITE
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        opponentName: "RookiePlayer",
        result: "loss",
        endReason: "resignation",
        moveCount: 28,
        duration: 18, // 18 minutes
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        userColor: PIECE_COLOR.BLACK
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        opponentName: "DrawMaster",
        result: "draw",
        endReason: "stalemate",
        moveCount: 67,
        duration: 52, // 52 minutes
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        userColor: PIECE_COLOR.WHITE
      }
    ]

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = mockGameHistory.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: mockGameHistory.length,
        totalPages: Math.ceil(mockGameHistory.length / limit)
      }
    }
  }

  private initializeChessBoard(): (PieceType | null)[][] {
    const board: (PieceType | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))

    // White pieces (bottom)
    board[0] = [
      PIECE_TYPE.ROOK,
      PIECE_TYPE.KNIGHT,
      PIECE_TYPE.BISHOP,
      PIECE_TYPE.QUEEN,
      PIECE_TYPE.KING,
      PIECE_TYPE.BISHOP,
      PIECE_TYPE.KNIGHT,
      PIECE_TYPE.ROOK
    ]
    board[1] = Array(8).fill(PIECE_TYPE.PAWN)

    // Black pieces (top)
    board[6] = Array(8).fill(PIECE_TYPE.PAWN)
    board[7] = [
      PIECE_TYPE.ROOK,
      PIECE_TYPE.KNIGHT,
      PIECE_TYPE.BISHOP,
      PIECE_TYPE.QUEEN,
      PIECE_TYPE.KING,
      PIECE_TYPE.BISHOP,
      PIECE_TYPE.KNIGHT,
      PIECE_TYPE.ROOK
    ]

    return board
  }

  static build(): GameService {
    return new GameService(GameDao.build(), IdGenerator.build())
  }
}
