import { BaseDomainEntity } from "./domain/base.types"
import { PieceColor, Position } from "./game-types"

export const OPENING_DIFFICULTY = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced"
} as const

export type OpeningDifficulty = (typeof OPENING_DIFFICULTY)[keyof typeof OPENING_DIFFICULTY]

export const CHESS_DATA_PROVIDER_TYPE = {
  LICHESS: "lichess",
  CHESSCOM: "chesscom",
  CHESSGAMES: "chessgames"
} as const

export type ChessDataProviderType = (typeof CHESS_DATA_PROVIDER_TYPE)[keyof typeof CHESS_DATA_PROVIDER_TYPE]

export const WHITE_OPENING_MOVE = {
  E4: "e4",
  D4: "d4",
  NF3: "Nf3",
  C4: "c4",
  G3: "g3",
  B3: "b3",
  F4: "f4",
  NC3: "Nc3",
  B4: "b4"
} as const

export type WhiteOpeningMove = (typeof WHITE_OPENING_MOVE)[keyof typeof WHITE_OPENING_MOVE]

export interface OpeningMove {
  /** Standard Algebraic Notation (e.g., "e4", "Nf3") */
  san: string
  /** From position */
  from: Position
  /** To position */
  to: Position
  /** Universal Chess Interface notation (e.g., "e2e4") */
  uci: string
  /** Piece that was captured, if any */
  captured?: string
  /** Whether this move is a promotion */
  promotion?: string
  /** Whether this move is castling */
  castling?: "kingside" | "queenside"
  /** Whether this move is en passant */
  enPassant?: boolean
}

export interface OpeningNode {
  /** Unique identifier for this node */
  id: string
  /** The move that leads to this position (null for root) */
  move: OpeningMove | null
  /** FEN string representing the position after this move */
  fen: string
  /** Comment or explanation for this move */
  comment?: string
  /** Evaluation of the position (centipawns) */
  evaluation?: number
  /** Whether this is a main line move */
  isMainLine: boolean
  /** Priority/importance of this move (1-10) */
  priority: number
  /** Child nodes (variations) */
  children: OpeningNode[]
  /** Statistical data */
  stats?: {
    /** Number of games played from this position */
    games: number
    /** Win percentage for white */
    whiteWins: number
    /** Draw percentage */
    draws: number
    /** Win percentage for black */
    blackWins: number
  }
  /** Tags for categorization */
  tags: string[]
  /** Timestamp when this node was last updated */
  lastUpdated: Date
}

export interface OpeningRepertoire extends BaseDomainEntity {
  /** Name of the opening repertoire */
  name: string
  /** Description of the repertoire */
  description?: string
  /** Color this repertoire is for */
  color: PieceColor
  /** Root node of the opening tree */
  rootNode: OpeningNode
  /** User who owns this repertoire */
  userId: string
  /** Whether this repertoire is public */
  isPublic: boolean
  /** Tags for categorization */
  tags: string[]
  /** Metadata */
  metadata: {
    /** Total number of positions in this repertoire */
    totalPositions: number
    /** Maximum depth of the tree */
    maxDepth: number
    /** Source of the repertoire (e.g., "manual", "pgn_import", "lichess") */
    source: string
    /** Version for tracking updates */
    version: number
  }
}

export interface TrainingSession {
  /** Unique identifier for this session */
  id: string
  /** Repertoire being trained */
  repertoireId: string
  /** User conducting the training */
  userId: string
  /** Current position in the tree */
  currentNodeId: string
  /** Path taken from root to current position */
  movePath: string[]
  /** Current board state (FEN) */
  currentFen: string
  /** Whether it's the user's turn to move */
  isUserTurn: boolean
  /** Score for this session */
  score: number
  /** Number of correct moves */
  correctMoves: number
  /** Number of incorrect moves */
  incorrectMoves: number
  /** Start time of the session */
  startTime: Date
  /** Session status */
  status: "active" | "completed" | "paused"
  /** Training mode */
  mode: "practice" | "test" | "review"
  /** Settings for this session */
  settings: {
    /** Show hints */
    showHints: boolean
    /** Allow takebacks */
    allowTakebacks: boolean
    /** Time limit per move (seconds, 0 = unlimited) */
    timeLimit: number
    /** Include sidelines in training */
    includeSidelines: boolean
  }
}

export interface MoveTrainingResult {
  /** Whether the move was correct */
  isCorrect: boolean
  /** The move that was attempted */
  attemptedMove: OpeningMove
  /** The expected move(s) from the repertoire */
  expectedMoves: OpeningMove[]
  /** Feedback message */
  feedback: string
  /** Updated session state */
  session: TrainingSession
  /** Next position FEN */
  nextFen: string
  /** Whether the training line is complete */
  isLineComplete: boolean
  /** Suggested continuation if move was incorrect */
  suggestion?: {
    move: OpeningMove
    explanation: string
  }
}

export interface OpeningProgress {
  /** User ID */
  userId: string
  /** Repertoire ID */
  repertoireId: string
  /** Node ID in the opening tree */
  nodeId: string
  /** Number of times this position was seen */
  timesReviewed: number
  /** Number of times answered correctly */
  timesCorrect: number
  /** Current ease factor for spaced repetition */
  easeFactor: number
  /** Next review date */
  nextReview: Date
  /** Current interval (days) */
  interval: number
  /** Last review date */
  lastReview: Date
  /** Streak of correct answers */
  streak: number
}

export interface PgnImportResult {
  /** Whether import was successful */
  success: boolean
  /** Created repertoire (if successful) */
  repertoire?: OpeningRepertoire
  /** Error message (if failed) */
  error?: string
  /** Import statistics */
  stats: {
    /** Number of games processed */
    gamesProcessed: number
    /** Number of positions created */
    positionsCreated: number
    /** Number of variations found */
    variationsFound: number
  }
}
