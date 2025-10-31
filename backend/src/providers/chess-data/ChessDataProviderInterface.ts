export interface ChessGameData {
  /** Game ID */
  id: string
  /** White player */
  white: {
    name: string
    rating: number
  }
  /** Black player */
  black: {
    name: string
    rating: number
  }
  /** Game result */
  winner?: "white" | "black"
  /** Year played */
  year: number
  /** Month played (optional) */
  month?: string
}

export interface ChessMoveData {
  /** UCI notation */
  uci: string
  /** SAN notation */
  san: string
  /** Number of games with this move */
  white: number
  draws: number
  black: number
  /** Average rating of players who played this move */
  averageRating: number
  /** Opening information */
  opening?: {
    /** ECO code */
    eco: string
    /** Opening name */
    name: string
  }
}

export interface ChessPositionData {
  /** Total number of games from this position */
  white: number
  draws: number
  black: number
  /** Available moves from this position */
  moves: ChessMoveData[]
  /** Top games from this position */
  topGames?: ChessGameData[]
}

export interface ChessDataProviderInterface {
  getPositionData(
    fen: string,
    options?: {
      /** Time controls to include */
      speeds?: string[]
      /** Rating ranges to include */
      ratings?: string[]
      /** Date range */
      since?: string | number
      until?: string | number
      /** Maximum number of moves to return */
      moves?: number
      /** Maximum number of top games to return */
      topGames?: number
    }
  ): Promise<ChessPositionData>

  getMasterData(
    fen: string,
    options?: {
      /** Date range for master games */
      since?: number
      until?: number
      /** Maximum number of moves to return */
      moves?: number
      /** Maximum number of top games to return */
      topGames?: number
    }
  ): Promise<ChessPositionData>

  searchOpenings?(query: string, limit?: number): Promise<ChessMoveData[]>

  getProviderInfo(): {
    name: string
    version: string
    baseUrl?: string
    rateLimit?: {
      requestsPerMinute: number
      requestsPerHour: number
    }
  }
}
