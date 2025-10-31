import type { PieceColor, Position } from "../components/ChessBoard/ChessBoard.types"

export const OPENING_DIFFICULTY = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced"
} as const

export type OpeningDifficulty = (typeof OPENING_DIFFICULTY)[keyof typeof OPENING_DIFFICULTY]

export const OPENING_FILTER = {
  ALL: "all",
  POPULAR: "popular",
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  WHITE: "white",
  BLACK: "black"
} as const

export type OpeningFilter = (typeof OPENING_FILTER)[keyof typeof OPENING_FILTER]

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

/**
 * Represents a single move in an opening tree
 */
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

/**
 * Represents a node in the opening tree
 */
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

/**
 * Represents a complete opening repertoire
 */
export interface OpeningRepertoire {
  /** Unique identifier */
  id: string
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
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Training session state
 */
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

/**
 * Result of a move attempt during training
 */
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

/**
 * Progress tracking for spaced repetition
 */
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

/**
 * PGN import result
 */
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

/**
 * Opening trainer state for React hooks
 */
export interface OpeningTrainerState {
  /** Current training session */
  session: TrainingSession | null
  /** Available repertoires for the user */
  repertoires: OpeningRepertoire[]
  /** Currently selected repertoire */
  selectedRepertoire: OpeningRepertoire | null
  /** Current position in the opening tree */
  currentNode: OpeningNode | null
  /** Loading states */
  loading: {
    session: boolean
    repertoires: boolean
    move: boolean
  }
  /** Error states */
  errors: {
    session?: string
    repertoires?: string
    move?: string
  }
  /** Training statistics */
  stats: {
    totalSessions: number
    averageScore: number
    streakCount: number
    positionsLearned: number
  }
}

/**
 * Actions for opening trainer state management
 */
export interface OpeningTrainerActions {
  /** Start a new training session */
  startSession: (repertoireId: string, mode: TrainingSession["mode"]) => Promise<void>
  /** End the current session */
  endSession: () => Promise<void>
  /** Pause the current session */
  pauseSession: () => Promise<void>
  /** Resume a paused session */
  resumeSession: () => Promise<void>
  /** Make a move in the current session */
  makeMove: (move: OpeningMove) => Promise<MoveTrainingResult>
  /** Load user's repertoires */
  loadRepertoires: () => Promise<void>
  /** Select a repertoire for training */
  selectRepertoire: (repertoire: OpeningRepertoire) => void
  /** Reset to starting position */
  resetPosition: () => void
  /** Go back one move (if allowed) */
  takeBack: () => void
  /** Clear errors */
  clearError: (errorType: keyof OpeningTrainerState["errors"]) => void
  /** Update session settings */
  updateSettings: (settings: Partial<TrainingSession["settings"]>) => void
}

/**
 * API request/response types
 */
export interface CreateTrainingSessionRequest {
  repertoireId: string
  mode: TrainingSession["mode"]
  settings?: Partial<TrainingSession["settings"]>
}

export interface CreateTrainingSessionResponse {
  session: TrainingSession
}

export interface MakeMoveRequest {
  sessionId: string
  move: OpeningMove
}

export interface MakeMoveResponse {
  result: MoveTrainingResult
}

export interface GetRepertoiresResponse {
  repertoires: OpeningRepertoire[]
}

export interface ImportPgnRequest {
  pgn: string
  name: string
  description?: string
  color: PieceColor
  tags?: string[]
}

export interface ImportPgnResponse {
  result: PgnImportResult
}
