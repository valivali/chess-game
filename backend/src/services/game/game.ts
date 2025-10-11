import { Game, GameStatusInfo, PIECE_COLOR, GAME_STATUS, PIECE_TYPE, PieceType } from "@/types/game-types"
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
