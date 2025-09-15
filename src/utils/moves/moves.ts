import type {
  CastlingRights,
  CastlingSide,
  ChessBoard,
  ChessPiece,
  PieceColor,
  Position
} from "../../components/ChessBoard/chessBoard.types"
import { CASTLING_SIDE, PIECE_COLOR, PIECE_TYPE, PIECE_WEIGHTS } from "../../components/ChessBoard/chessBoard.types"
import { isPositionEqual, isValidPosition } from "../position/position"

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

const getSlidingMoves = (
  x: number,
  y: number,
  directions: readonly (readonly [number, number])[],
  board: ChessBoard,
  pieceColor: string
): Position[] => {
  const moves: Position[] = []

  for (const [dx, dy] of directions) {
    const getMovesInDirection = (currentX: number, currentY: number): void => {
      if (!isValidPosition(currentX, currentY)) return

      const targetPiece = board[currentX][currentY]

      if (!targetPiece) {
        moves.push({ x: currentX, y: currentY })
        getMovesInDirection(currentX + dx, currentY + dy)
      } else if (targetPiece.color !== pieceColor) {
        moves.push({ x: currentX, y: currentY })
      }
    }

    getMovesInDirection(x + dx, y + dy)
  }

  return moves
}

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

const getPawnMoves = (x: number, y: number, piece: ChessPiece, board: ChessBoard, enPassantTarget?: Position | null): Position[] => {
  const moves: Position[] = []
  const direction = piece.color === PIECE_COLOR.WHITE ? -1 : 1
  const startRow = piece.color === PIECE_COLOR.WHITE ? 6 : 1

  const oneStep = x + direction
  if (isValidPosition(oneStep, y) && !board[oneStep][y]) {
    moves.push({ x: oneStep, y })

    if (x === startRow) {
      const twoSteps = x + 2 * direction
      if (isValidPosition(twoSteps, y) && !board[twoSteps][y]) {
        moves.push({ x: twoSteps, y })
      }
    }
  }

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

  if (enPassantTarget) {
    if (y > 0 && enPassantTarget.x === oneStep && enPassantTarget.y === captureY1) {
      const enemyPawn = board[x][captureY1]
      if (enemyPawn && enemyPawn.type === PIECE_TYPE.PAWN && enemyPawn.color !== piece.color) {
        moves.push({ x: oneStep, y: captureY1 })
      }
    }
    if (y < 7 && enPassantTarget.x === oneStep && enPassantTarget.y === captureY2) {
      const enemyPawn = board[x][captureY2]
      if (enemyPawn && enemyPawn.type === PIECE_TYPE.PAWN && enemyPawn.color !== piece.color) {
        moves.push({ x: oneStep, y: captureY2 })
      }
    }
  }

  return moves
}

const getKingMoves = (x: number, y: number, piece: ChessPiece, board: ChessBoard, castlingRights?: CastlingRights): Position[] => {
  const regularMoves = getJumpingMoves(x, y, KING_MOVES, board, piece.color)

  if (castlingRights) {
    const castlingMoves = getCastlingMoves(board, piece.color, castlingRights)
    return [...regularMoves, ...castlingMoves]
  }

  return regularMoves
}

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
  [PIECE_TYPE.KING]: getKingMoves
} as const

export const getValidMoves = (
  piece: ChessPiece,
  position: Position,
  board: ChessBoard,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): Position[] => {
  const { x, y } = position
  if (piece.type === PIECE_TYPE.PAWN) {
    return getPawnMoves(x, y, piece, board, enPassantTarget)
  }
  if (piece.type === PIECE_TYPE.KING) {
    return getKingMoves(x, y, piece, board, castlingRights)
  }
  const moveFunction = moveFunctions[piece.type]
  return moveFunction(x, y, piece, board)
}

export const isEnPassantCapture = (piece: ChessPiece, from: Position, to: Position, enPassantTarget: Position | null): boolean => {
  if (!enPassantTarget || piece.type !== PIECE_TYPE.PAWN) {
    return false
  }

  if (!isPositionEqual(to, enPassantTarget)) {
    return false
  }

  const deltaX = Math.abs(to.x - from.x)
  const deltaY = Math.abs(to.y - from.y)

  return deltaX === 1 && deltaY === 1
}

export const isPositionUnderAttack = (board: ChessBoard, position: Position, attackingColor: string): boolean => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y]
      if (piece && piece.color === attackingColor) {
        const moves = getValidMoves(piece, { x, y }, board)
        if (moves.some((move) => isPositionEqual(move, position))) {
          return true
        }
      }
    }
  }
  return false
}

export const wouldLeaveKingInCheck = (
  board: ChessBoard,
  from: Position,
  to: Position,
  playerColor: string,
  enPassantTarget?: Position | null
): boolean => {
  const testBoard = board.map((row) => [...row])
  const piece = testBoard[from.x][from.y]

  if (!piece) return false

  if (isCastlingMove(from, to, piece)) {
    const side = getCastlingSide(from, to)
    const kingRow = piece.color === PIECE_COLOR.WHITE ? 7 : 0
    const rookFromCol = side === CASTLING_SIDE.KINGSIDE ? 7 : 0
    const rookToCol = side === CASTLING_SIDE.KINGSIDE ? 5 : 3

    testBoard[to.x][to.y] = piece
    testBoard[from.x][from.y] = null

    const rook = testBoard[kingRow][rookFromCol]
    if (rook) {
      testBoard[kingRow][rookToCol] = rook
      testBoard[kingRow][rookFromCol] = null
    }
  } else {
    if (enPassantTarget && isEnPassantCapture(piece, from, to, enPassantTarget)) {
      testBoard[from.x][to.y] = null
    }

    testBoard[to.x][to.y] = piece
    testBoard[from.x][from.y] = null
  }

  return isInCheck(testBoard, playerColor)
}

export const getLegalMoves = (
  piece: ChessPiece,
  position: Position,
  board: ChessBoard,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): Position[] => {
  const possibleMoves = getValidMoves(piece, position, board, enPassantTarget, castlingRights)

  return possibleMoves.filter((move) => !wouldLeaveKingInCheck(board, position, move, piece.color, enPassantTarget))
}

export const getAllLegalMovesForPlayer = (
  board: ChessBoard,
  playerColor: string,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): Array<{ from: Position; to: Position }> => {
  const legalMoves: Array<{ from: Position; to: Position }> = []

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y]
      if (piece && piece.color === playerColor) {
        const moves = getLegalMoves(piece, { x, y }, board, enPassantTarget, castlingRights)
        moves.forEach((move) => {
          legalMoves.push({ from: { x, y }, to: move })
        })
      }
    }
  }

  return legalMoves
}

export const isCheckmate = (
  board: ChessBoard,
  playerColor: string,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): boolean => {
  const inCheck = isInCheck(board, playerColor)
  const legalMoves = getAllLegalMovesForPlayer(board, playerColor, enPassantTarget, castlingRights)

  return inCheck && legalMoves.length === 0
}

export const isStalemate = (
  board: ChessBoard,
  playerColor: string,
  enPassantTarget?: Position | null,
  castlingRights?: CastlingRights
): boolean => {
  const inCheck = isInCheck(board, playerColor)
  const legalMoves = getAllLegalMovesForPlayer(board, playerColor, enPassantTarget, castlingRights)

  return !inCheck && legalMoves.length === 0
}

export const createInitialCastlingRights = (): CastlingRights => ({
  white: {
    kingside: true,
    queenside: true
  },
  black: {
    kingside: true,
    queenside: true
  }
})

export const updateCastlingRights = (castlingRights: CastlingRights, from: Position, piece: ChessPiece): CastlingRights => {
  const newRights = {
    white: { ...castlingRights.white },
    black: { ...castlingRights.black }
  }

  if (piece.type === PIECE_TYPE.KING) {
    if (piece.color === PIECE_COLOR.WHITE) {
      newRights.white.kingside = false
      newRights.white.queenside = false
    } else {
      newRights.black.kingside = false
      newRights.black.queenside = false
    }
  }

  if (piece.type === PIECE_TYPE.ROOK) {
    if (piece.color === PIECE_COLOR.WHITE) {
      if (from.x === 7 && from.y === 0) {
        newRights.white.queenside = false
      } else if (from.x === 7 && from.y === 7) {
        newRights.white.kingside = false
      }
    } else {
      if (from.x === 0 && from.y === 0) {
        newRights.black.queenside = false
      } else if (from.x === 0 && from.y === 7) {
        newRights.black.kingside = false
      }
    }
  }

  return newRights
}

export const canCastle = (board: ChessBoard, playerColor: string, side: CastlingSide, castlingRights: CastlingRights): boolean => {
  const isWhite = playerColor === PIECE_COLOR.WHITE
  const kingRow = isWhite ? 7 : 0
  const kingCol = 4

  const rights = isWhite ? castlingRights.white : castlingRights.black
  if (!rights[side]) {
    return false
  }

  const king = board[kingRow][kingCol]
  if (!king || king.type !== PIECE_TYPE.KING || king.color !== playerColor) {
    return false
  }

  if (isInCheck(board, playerColor)) {
    return false
  }

  const rookCol = side === CASTLING_SIDE.KINGSIDE ? 7 : 0

  const rook = board[kingRow][rookCol]
  if (!rook || rook.type !== PIECE_TYPE.ROOK || rook.color !== playerColor) {
    return false
  }

  const startCol = Math.min(kingCol, rookCol)
  const endCol = Math.max(kingCol, rookCol)
  for (let col = startCol + 1; col < endCol; col++) {
    if (board[kingRow][col] !== null) {
      return false
    }
  }

  const opponentColor = isWhite ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE
  const colsToCheck = side === CASTLING_SIDE.KINGSIDE ? [5, 6] : [2, 3]

  for (const col of colsToCheck) {
    if (isPositionUnderAttack(board, { x: kingRow, y: col }, opponentColor)) {
      return false
    }
  }

  return true
}

export const getCastlingMoves = (board: ChessBoard, playerColor: string, castlingRights: CastlingRights): Position[] => {
  const moves: Position[] = []
  const kingRow = playerColor === PIECE_COLOR.WHITE ? 7 : 0

  if (canCastle(board, playerColor, CASTLING_SIDE.KINGSIDE, castlingRights)) {
    moves.push({ x: kingRow, y: 6 })
  }

  if (canCastle(board, playerColor, CASTLING_SIDE.QUEENSIDE, castlingRights)) {
    moves.push({ x: kingRow, y: 2 })
  }

  return moves
}

export const isCastlingMove = (from: Position, to: Position, piece: ChessPiece): boolean => {
  if (piece.type !== PIECE_TYPE.KING) {
    return false
  }

  const deltaY = Math.abs(to.y - from.y)
  return deltaY === 2
}

export const getCastlingSide = (from: Position, to: Position): CastlingSide => {
  return to.y > from.y ? CASTLING_SIDE.KINGSIDE : CASTLING_SIDE.QUEENSIDE
}

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

export const isInCheck = (board: ChessBoard, playerColor: string): boolean => {
  const kingPosition = findKingPosition(board, playerColor)
  if (!kingPosition) return false

  const opponentColor = playerColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE

  return isPositionUnderAttack(board, kingPosition, opponentColor)
}

export const isPawnPromotion = (piece: ChessPiece, to: Position): boolean => {
  if (piece.type !== PIECE_TYPE.PAWN) {
    return false
  }

  const promotionRow = piece.color === PIECE_COLOR.WHITE ? 0 : 7

  return to.x === promotionRow
}

export const createPromotedQueen = (pawnColor: string): ChessPiece => {
  return {
    type: PIECE_TYPE.QUEEN,
    color: pawnColor as PieceColor,
    weight: PIECE_WEIGHTS[PIECE_TYPE.QUEEN]
  }
}
