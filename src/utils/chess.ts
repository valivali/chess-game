import type { ChessBoard, ChessPiece, PieceType, Position } from "../components/ChessBoard/types"
import { PIECE_COLOR, PIECE_TYPE } from "../components/ChessBoard/types"

export const createInitialBoard = (): ChessBoard => {
  const board: ChessBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.BLACK }
    board[6][i] = { type: PIECE_TYPE.PAWN, color: PIECE_COLOR.WHITE }
  }

  // Place other pieces
  const pieceOrder: PieceType[] = [
    PIECE_TYPE.ROOK,
    PIECE_TYPE.KNIGHT,
    PIECE_TYPE.BISHOP,
    PIECE_TYPE.QUEEN,
    PIECE_TYPE.KING,
    PIECE_TYPE.BISHOP,
    PIECE_TYPE.KNIGHT,
    PIECE_TYPE.ROOK
  ]

  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: pieceOrder[i], color: PIECE_COLOR.BLACK }
    board[7][i] = { type: pieceOrder[i], color: PIECE_COLOR.WHITE }
  }

  return board
}

export const isValidPosition = (x: number, y: number): boolean => {
  return x >= 0 && x < 8 && y >= 0 && y < 8
}

// Pre-computed move patterns for optimal performance
const KNIGHT_MOVES = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1]
] as const

const KING_MOVES = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
] as const

const ROOK_DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0]
] as const
const BISHOP_DIRECTIONS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
] as const
const QUEEN_DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
] as const

// Optimized sliding piece moves (rook, bishop, queen)
const getSlidingMoves = (
  x: number,
  y: number,
  directions: readonly (readonly [number, number])[],
  board: ChessBoard,
  pieceColor: string
): Position[] => {
  const moves: Position[] = []

  for (const [dx, dy] of directions) {
    let newX = x + dx
    let newY = y + dy

    while (isValidPosition(newX, newY)) {
      const targetPiece = board[newX][newY]

      if (!targetPiece) {
        moves.push({ x: newX, y: newY })
      } else {
        if (targetPiece.color !== pieceColor) {
          moves.push({ x: newX, y: newY })
        }
        break
      }

      newX += dx
      newY += dy
    }
  }

  return moves
}

// Optimized jumping piece moves (knight, king)
const getJumpingMoves = (
  x: number,
  y: number,
  moves: readonly (readonly [number, number])[],
  board: ChessBoard,
  pieceColor: string
): Position[] => {
  const validMoves: Position[] = []

  for (const [dx, dy] of moves) {
    const newX = x + dx
    const newY = y + dy

    if (isValidPosition(newX, newY)) {
      const targetPiece = board[newX][newY]
      if (!targetPiece || targetPiece.color !== pieceColor) {
        validMoves.push({ x: newX, y: newY })
      }
    }
  }

  return validMoves
}

// Optimized pawn moves with en passant support
const getPawnMoves = (x: number, y: number, piece: ChessPiece, board: ChessBoard, enPassantTarget?: Position | null): Position[] => {
  const moves: Position[] = []
  const direction = piece.color === PIECE_COLOR.WHITE ? -1 : 1
  const startRow = piece.color === PIECE_COLOR.WHITE ? 6 : 1

  // Forward moves
  const oneStep = x + direction
  if (isValidPosition(oneStep, y) && !board[oneStep][y]) {
    moves.push({ x: oneStep, y })

    // Two steps from starting position
    if (x === startRow) {
      const twoSteps = x + 2 * direction
      if (isValidPosition(twoSteps, y) && !board[twoSteps][y]) {
        moves.push({ x: twoSteps, y })
      }
    }
  }

  // Diagonal captures - optimized to avoid loop
  const captureY1 = y - 1
  const captureY2 = y + 1

  if (isValidPosition(oneStep, captureY1)) {
    const targetPiece = board[oneStep][captureY1]
    if (targetPiece && targetPiece.color !== piece.color) {
      moves.push({ x: oneStep, y: captureY1 })
    }
  }

  if (isValidPosition(oneStep, captureY2)) {
    const targetPiece = board[oneStep][captureY2]
    if (targetPiece && targetPiece.color !== piece.color) {
      moves.push({ x: oneStep, y: captureY2 })
    }
  }

  // En passant capture
  if (enPassantTarget) {
    // Check if we can capture en passant to the left
    if (y > 0 && enPassantTarget.x === oneStep && enPassantTarget.y === captureY1) {
      // Verify there's an enemy pawn on the same rank
      const enemyPawn = board[x][captureY1]
      if (enemyPawn && enemyPawn.type === PIECE_TYPE.PAWN && enemyPawn.color !== piece.color) {
        moves.push({ x: oneStep, y: captureY1 })
      }
    }
    // Check if we can capture en passant to the right
    if (y < 7 && enPassantTarget.x === oneStep && enPassantTarget.y === captureY2) {
      // Verify there's an enemy pawn on the same rank
      const enemyPawn = board[x][captureY2]
      if (enemyPawn && enemyPawn.type === PIECE_TYPE.PAWN && enemyPawn.color !== piece.color) {
        moves.push({ x: oneStep, y: captureY2 })
      }
    }
  }

  return moves
}

// Function lookup table - fastest approach from benchmarks
const moveFunctions = {
  [PIECE_TYPE.PAWN]: getPawnMoves,
  [PIECE_TYPE.ROOK]: (x: number, y: number, piece: ChessPiece, board: ChessBoard) =>
    getSlidingMoves(x, y, ROOK_DIRECTIONS, board, piece.color),
  [PIECE_TYPE.KNIGHT]: (x: number, y: number, piece: ChessPiece, board: ChessBoard) =>
    getJumpingMoves(x, y, KNIGHT_MOVES, board, piece.color),
  [PIECE_TYPE.BISHOP]: (x: number, y: number, piece: ChessPiece, board: ChessBoard) =>
    getSlidingMoves(x, y, BISHOP_DIRECTIONS, board, piece.color),
  [PIECE_TYPE.QUEEN]: (x: number, y: number, piece: ChessPiece, board: ChessBoard) =>
    getSlidingMoves(x, y, QUEEN_DIRECTIONS, board, piece.color),
  [PIECE_TYPE.KING]: (x: number, y: number, piece: ChessPiece, board: ChessBoard) => getJumpingMoves(x, y, KING_MOVES, board, piece.color)
} as const

export const getValidMoves = (piece: ChessPiece, position: Position, board: ChessBoard, enPassantTarget?: Position | null): Position[] => {
  const { x, y } = position
  if (piece.type === PIECE_TYPE.PAWN) {
    return getPawnMoves(x, y, piece, board, enPassantTarget)
  }
  const moveFunction = moveFunctions[piece.type]
  return moveFunction(x, y, piece, board)
}

// Utility function to compare positions
export const isPositionEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

// Check if a move is an en passant capture
export const isEnPassantCapture = (piece: ChessPiece, from: Position, to: Position, enPassantTarget: Position | null): boolean => {
  if (!enPassantTarget || piece.type !== PIECE_TYPE.PAWN) {
    return false
  }

  // Check if moving to the en passant target square
  if (!isPositionEqual(to, enPassantTarget)) {
    return false
  }

  // Check if it's a diagonal move (capture move)
  const deltaX = Math.abs(to.x - from.x)
  const deltaY = Math.abs(to.y - from.y)

  return deltaX === 1 && deltaY === 1
}

// Find the king position for a given color
export const findKingPosition = (board: ChessBoard, color: string): Position | null => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y]
      if (piece && piece.type === PIECE_TYPE.KING && piece.color === color) {
        return { x, y }
      }
    }
  }
  return null
}

// Check if a position is under attack by the opponent (without checking for check to avoid recursion)
export const isPositionUnderAttack = (board: ChessBoard, position: Position, attackingColor: string): boolean => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y]
      if (piece && piece.color === attackingColor) {
        // Use basic move generation without en passant or check validation to avoid recursion
        const moves = getValidMoves(piece, { x, y }, board)
        if (moves.some((move) => isPositionEqual(move, position))) {
          return true
        }
      }
    }
  }
  return false
}

// Check if the current player's king is in check
export const isInCheck = (board: ChessBoard, playerColor: string): boolean => {
  const kingPosition = findKingPosition(board, playerColor)
  if (!kingPosition) return false

  const opponentColor = playerColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE

  return isPositionUnderAttack(board, kingPosition, opponentColor)
}

// Check if a move would leave the king in check (illegal move)
export const wouldLeaveKingInCheck = (
  board: ChessBoard,
  from: Position,
  to: Position,
  playerColor: string,
  enPassantTarget?: Position | null
): boolean => {
  // Create a copy of the board and make the move
  const testBoard = board.map((row) => [...row])
  const piece = testBoard[from.x][from.y]

  if (!piece) return false

  // Handle en passant capture on test board
  if (enPassantTarget && isEnPassantCapture(piece, from, to, enPassantTarget)) {
    testBoard[from.x][to.y] = null
  }

  // Make the move on test board
  testBoard[to.x][to.y] = piece
  testBoard[from.x][from.y] = null

  // Check if king is in check after the move
  return isInCheck(testBoard, playerColor)
}

// Get all legal moves for a piece (excluding moves that would leave king in check)
export const getLegalMoves = (piece: ChessPiece, position: Position, board: ChessBoard, enPassantTarget?: Position | null): Position[] => {
  const possibleMoves = getValidMoves(piece, position, board, enPassantTarget)

  return possibleMoves.filter((move) => !wouldLeaveKingInCheck(board, position, move, piece.color, enPassantTarget))
}

// Get all legal moves for a player
export const getAllLegalMovesForPlayer = (
  board: ChessBoard,
  playerColor: string,
  enPassantTarget?: Position | null
): Array<{ from: Position; to: Position }> => {
  const legalMoves: Array<{ from: Position; to: Position }> = []

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y]
      if (piece && piece.color === playerColor) {
        const moves = getLegalMoves(piece, { x, y }, board, enPassantTarget)
        moves.forEach((move) => {
          legalMoves.push({ from: { x, y }, to: move })
        })
      }
    }
  }

  return legalMoves
}

// Check if the current player is in checkmate
export const isCheckmate = (board: ChessBoard, playerColor: string, enPassantTarget?: Position | null): boolean => {
  const inCheck = isInCheck(board, playerColor)
  const legalMoves = getAllLegalMovesForPlayer(board, playerColor, enPassantTarget)

  return inCheck && legalMoves.length === 0
}

// Check if the current player is in stalemate
export const isStalemate = (board: ChessBoard, playerColor: string, enPassantTarget?: Position | null): boolean => {
  const inCheck = isInCheck(board, playerColor)
  const legalMoves = getAllLegalMovesForPlayer(board, playerColor, enPassantTarget)

  return !inCheck && legalMoves.length === 0
}
