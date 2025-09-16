import React, { useCallback, useState } from "react"
import { match } from "ts-pattern"

import { CASTLING_SIDE, GAME_STATUS, PIECE_COLOR, PIECE_TYPE } from "../components/ChessBoard"
import type {
  CastlingRights,
  ChessBoard as ChessBoardType,
  ChessPiece as ChessPieceType,
  GameStatus,
  Move,
  PieceColor,
  Position
} from "../components/ChessBoard/ChessBoard.types.ts"
import { createInitialBoard } from "../utils/board"
import {
  createInitialCastlingRights,
  createPromotedQueen,
  getCastlingSide,
  getLegalMoves,
  isCastlingMove,
  isCheckmate,
  isEnPassantCapture,
  isInCheck,
  isPawnPromotion,
  isStalemate,
  updateCastlingRights
} from "../utils/moves"
import { isPositionEqual } from "../utils/position"

export interface ChessGameState {
  board: ChessBoardType
  selectedPiecePosition: Position | null
  validMoves: Position[]
  currentPlayer: PieceColor
  draggedPiece: { piece: ChessPieceType; from: Position } | null
  enPassantTarget: Position | null
  gameStatus: GameStatus
  showCelebration: boolean
  winner: PieceColor | null
  whiteCapturedPieces: ChessPieceType[]
  blackCapturedPieces: ChessPieceType[]
  castlingRights: CastlingRights
  lastMove: Move | null
}

export interface MoveResult {
  capturedPiece: ChessPieceType | null
  newEnPassantTarget: Position | null
}

export interface ChessGameActions {
  makeMove: (from: Position, to: Position) => void
  handleSquareClick: (position: Position) => void
  handleDragStart: (e: React.DragEvent, piece: ChessPieceType, position: Position) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, position: Position) => void
  handleCelebrationComplete: () => void
  isSquareHighlighted: (position: Position) => boolean
}

export const useChessGame = (): [ChessGameState, ChessGameActions] => {
  const [board, setBoard] = useState<ChessBoardType>(createInitialBoard)
  const [selectedPiecePosition, setSelectedPiecePosition] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>(PIECE_COLOR.WHITE)
  const [draggedPiece, setDraggedPiece] = useState<{ piece: ChessPieceType; from: Position } | null>(null)
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null)
  const [gameStatus, setGameStatus] = useState<GameStatus>(GAME_STATUS.PLAYING)
  const [showCelebration, setShowCelebration] = useState(false)
  const [winner, setWinner] = useState<PieceColor | null>(null)
  const [whiteCapturedPieces, setWhiteCapturedPieces] = useState<ChessPieceType[]>([])
  const [blackCapturedPieces, setBlackCapturedPieces] = useState<ChessPieceType[]>([])
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(createInitialCastlingRights)
  const [lastMove, setLastMove] = useState<Move | null>(null)

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard())
    setSelectedPiecePosition(null)
    setValidMoves([])
    setCurrentPlayer(PIECE_COLOR.WHITE)
    setDraggedPiece(null)
    setEnPassantTarget(null)
    setGameStatus(GAME_STATUS.PLAYING)
    setWinner(null)
    setWhiteCapturedPieces([])
    setBlackCapturedPieces([])
    setCastlingRights(createInitialCastlingRights())
    setLastMove(null)
  }, [])

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
    resetGame()
  }, [resetGame])

  const handlePieceSpecificMove = useCallback(
    (piece: ChessPieceType, from: Position, to: Position, board: ChessBoardType, enPassantTarget: Position | null): MoveResult => {
      return match(piece.type)
        .with(PIECE_TYPE.KING, () => {
          const isCastling = isCastlingMove(from, to, piece)

          if (isCastling) {
            const side = getCastlingSide(from, to)
            const kingRow = piece.color === PIECE_COLOR.WHITE ? 7 : 0
            const rookFromCol = side === CASTLING_SIDE.KINGSIDE ? 7 : 0
            const rookToCol = side === CASTLING_SIDE.KINGSIDE ? 5 : 3

            board[to.x][to.y] = piece
            board[from.x][from.y] = null

            const rook = board[kingRow][rookFromCol]
            if (rook) {
              board[kingRow][rookToCol] = rook
              board[kingRow][rookFromCol] = null
            }

            return { capturedPiece: null, newEnPassantTarget: null }
          } else {
            const captured = board[to.x][to.y]
            board[to.x][to.y] = piece
            board[from.x][from.y] = null
            return { capturedPiece: captured, newEnPassantTarget: null }
          }
        })
        .with(PIECE_TYPE.PAWN, () => {
          const isEnPassant = isEnPassantCapture(piece, from, to, enPassantTarget)
          const captured = isEnPassant ? board[from.x][to.y] : board[to.x][to.y]

          if (isEnPassant) {
            board[from.x][to.y] = null
          }

          const pieceToPlace = isPawnPromotion(piece, to) ? createPromotedQueen(piece.color) : piece
          board[to.x][to.y] = pieceToPlace
          board[from.x][from.y] = null

          const newEnPassantTargetForPawn =
            Math.abs(to.x - from.x) === 2
              ? {
                  x: from.x + (to.x - from.x) / 2,
                  y: from.y
                }
              : null

          return { capturedPiece: captured, newEnPassantTarget: newEnPassantTargetForPawn }
        })
        .with(PIECE_TYPE.ROOK, PIECE_TYPE.KNIGHT, PIECE_TYPE.BISHOP, PIECE_TYPE.QUEEN, () => {
          const captured = board[to.x][to.y]
          board[to.x][to.y] = piece
          board[from.x][from.y] = null
          return { capturedPiece: captured, newEnPassantTarget: null }
        })
        .exhaustive()
    },
    []
  )

  const makeMove = useCallback(
    (from: Position, to: Position) => {
      const newBoard = board.map((row) => [...row])
      const piece = newBoard[from.x][from.y]

      if (!piece) return

      const { capturedPiece, newEnPassantTarget } = handlePieceSpecificMove(piece, from, to, newBoard, enPassantTarget)

      const newWhiteCaptured =
        capturedPiece && currentPlayer === PIECE_COLOR.WHITE
          ? [...whiteCapturedPieces, capturedPiece].sort((a, b) => b.weight - a.weight)
          : whiteCapturedPieces

      const newBlackCaptured =
        capturedPiece && currentPlayer === PIECE_COLOR.BLACK
          ? [...blackCapturedPieces, capturedPiece].sort((a, b) => b.weight - a.weight)
          : blackCapturedPieces

      const newCastlingRights = updateCastlingRights(castlingRights, from, piece)
      const nextPlayer = currentPlayer === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE

      setBoard(newBoard)
      setSelectedPiecePosition(null)
      setValidMoves([])
      setCurrentPlayer(nextPlayer)
      setEnPassantTarget(newEnPassantTarget)
      setWhiteCapturedPieces(newWhiteCaptured)
      setBlackCapturedPieces(newBlackCaptured)
      setCastlingRights(newCastlingRights)
      setLastMove({ from, to })

      const nextPlayerInCheck = isInCheck(newBoard, nextPlayer)
      const nextPlayerCheckmate = isCheckmate(newBoard, nextPlayer, newEnPassantTarget, newCastlingRights)
      const nextPlayerStalemate = isStalemate(newBoard, nextPlayer, newEnPassantTarget, newCastlingRights)

      const newGameStatus: GameStatus = nextPlayerCheckmate
        ? GAME_STATUS.CHECKMATE
        : nextPlayerStalemate
          ? GAME_STATUS.STALEMATE
          : nextPlayerInCheck
            ? GAME_STATUS.CHECK
            : GAME_STATUS.PLAYING

      if (nextPlayerCheckmate) {
        setWinner(currentPlayer)
        setShowCelebration(true)
      }

      setGameStatus(newGameStatus)
    },
    [board, currentPlayer, enPassantTarget, whiteCapturedPieces, blackCapturedPieces, castlingRights, handlePieceSpecificMove]
  )

  const handleSquareClick = useCallback(
    (position: Position) => {
      if (gameStatus === GAME_STATUS.CHECKMATE || gameStatus === GAME_STATUS.STALEMATE) {
        return
      }

      const piece = board[position.x][position.y]

      if (selectedPiecePosition) {
        if (validMoves.some((move) => isPositionEqual(move, position))) {
          makeMove(selectedPiecePosition, position)
          return
        }

        if (isPositionEqual(selectedPiecePosition, position)) {
          setSelectedPiecePosition(null)
          setValidMoves([])
          return
        }

        if (piece && piece.color === currentPlayer) {
          const moves = getLegalMoves(piece, position, board, enPassantTarget, castlingRights)
          setSelectedPiecePosition(position)
          setValidMoves(moves)
          return
        }

        setSelectedPiecePosition(null)
        setValidMoves([])
      } else {
        if (piece && piece.color === currentPlayer) {
          const moves = getLegalMoves(piece, position, board, enPassantTarget, castlingRights)
          setSelectedPiecePosition(position)
          setValidMoves(moves)
        }
      }
    },
    [board, selectedPiecePosition, validMoves, currentPlayer, makeMove, enPassantTarget, gameStatus, castlingRights]
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent, piece: ChessPieceType, position: Position) => {
      if (piece.color !== currentPlayer || gameStatus === GAME_STATUS.CHECKMATE || gameStatus === GAME_STATUS.STALEMATE) {
        e.preventDefault()
        return
      }

      setDraggedPiece({ piece, from: position })
      setSelectedPiecePosition(position)
      setValidMoves(getLegalMoves(piece, position, board, enPassantTarget, castlingRights))
    },
    [currentPlayer, board, enPassantTarget, gameStatus, castlingRights]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, position: Position) => {
      e.preventDefault()

      if (!draggedPiece) return

      const isValidMove = validMoves.some((move) => isPositionEqual(move, position))

      if (isValidMove) {
        makeMove(draggedPiece.from, position)
      }

      setDraggedPiece(null)
    },
    [draggedPiece, validMoves, makeMove]
  )

  const isSquareHighlighted = useCallback(
    (position: Position): boolean => {
      if (!lastMove) return false
      return isPositionEqual(lastMove.from, position) || isPositionEqual(lastMove.to, position)
    },
    [lastMove]
  )

  const gameState: ChessGameState = {
    board,
    selectedPiecePosition,
    validMoves,
    currentPlayer,
    draggedPiece,
    enPassantTarget,
    gameStatus,
    showCelebration,
    winner,
    whiteCapturedPieces,
    blackCapturedPieces,
    castlingRights,
    lastMove
  }

  const gameActions: ChessGameActions = {
    makeMove,
    handleSquareClick,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleCelebrationComplete,
    isSquareHighlighted
  }

  return [gameState, gameActions]
}
