import { Game, GameStatusInfo, PIECE_COLOR, GAME_STATUS, PIECE_TYPE, PieceType } from "@/types/gameTypes"
import { v4 as uuidv4 } from "uuid"

interface IdGeneratorInterface {
  generateId(): string
}

export interface GameServiceInterface {
  createGame(playerName?: string): Promise<Game>
  getGame(gameId: string): Promise<Game | null>
  updateGame(game: Game): Promise<Game>
  resetGame(gameId: string): Promise<Game>
  deleteGame(gameId: string): Promise<void>
  getGameStatus(gameId: string): Promise<GameStatusInfo | null>
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
  private games: Map<string, Game> = new Map()

  constructor(private readonly idGenerator: IdGeneratorInterface) {}

  async createGame(playerName?: string): Promise<Game> {
    const gameId = this.idGenerator.generateId()

    const board = this.initializeChessBoard()

    const game: Game = {
      id: gameId,
      board,
      currentPlayer: PIECE_COLOR.WHITE,
      status: GAME_STATUS.ACTIVE,
      winner: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.games.set(gameId, game)

    return game
  }

  async getGame(gameId: string): Promise<Game | null> {
    return this.games.get(gameId) || null
  }

  async updateGame(game: Game): Promise<Game> {
    this.games.set(game.id, game)
    return game
  }

  async resetGame(gameId: string): Promise<Game> {
    const existingGame = this.games.get(gameId)
    if (!existingGame) {
      throw new Error("Game not found")
    }

    const game: Game = {
      ...existingGame,
      board: this.initializeChessBoard(),
      currentPlayer: PIECE_COLOR.WHITE,
      status: GAME_STATUS.ACTIVE,
      winner: null,
      updatedAt: new Date()
    }

    this.games.set(gameId, game)

    return game
  }

  async deleteGame(gameId: string): Promise<void> {
    this.games.delete(gameId)
  }

  async getGameStatus(gameId: string): Promise<GameStatusInfo | null> {
    const game = this.games.get(gameId)
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
    return new GameService(IdGenerator.build())
  }
}
