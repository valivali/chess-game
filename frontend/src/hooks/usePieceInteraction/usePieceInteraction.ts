import React, { useCallback, useState } from "react"

import { GAME_STATUS } from "../../components/ChessBoard"
import type {
  CastlingRights,
  ChessBoard as ChessBoardType,
  GameStatus,
  PieceColor,
  Position
} from "../../components/ChessBoard/ChessBoard.types"
import type { IChessPiece } from "../../components/pieces"
import { getLegalMoves } from "../../utils/moves"
import { isPositionEqual } from "../../utils/position"

export interface PieceInteractionState {
  selectedPiecePosition: Position | null
  validMoves: Position[]
  draggedPiece: { piece: IChessPiece; from: Position } | null
}

export interface PieceInteractionActions {
  handleSquareClick: (position: Position) => void
  handleDragStart: (e: React.DragEvent, piece: IChessPiece, position: Position) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, position: Position) => void
  clearSelection: () => void
  selectPiece: (position: Position, piece: IChessPiece) => void
  isValidMove: (position: Position) => boolean
}

interface UsePieceInteractionProps {
  board: ChessBoardType
  currentPlayer: PieceColor
  gameStatus: GameStatus
  enPassantTarget: Position | null
  castlingRights: CastlingRights
  onMoveAttempt: (from: Position, to: Position) => void
}

export const usePieceInteraction = ({
  board,
  currentPlayer,
  gameStatus,
  enPassantTarget,
  castlingRights,
  onMoveAttempt
}: UsePieceInteractionProps): [PieceInteractionState, PieceInteractionActions] => {
  const [selectedPiecePosition, setSelectedPiecePosition] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [draggedPiece, setDraggedPiece] = useState<{ piece: IChessPiece; from: Position } | null>(null)

  const isGameActive = gameStatus !== GAME_STATUS.CHECKMATE && gameStatus !== GAME_STATUS.STALEMATE

  const clearSelection = useCallback(() => {
    setSelectedPiecePosition(null)
    setValidMoves([])
  }, [])

  const selectPiece = useCallback(
    (position: Position, piece: IChessPiece) => {
      if (piece.color === currentPlayer && isGameActive) {
        const moves = getLegalMoves(piece, position, board, enPassantTarget, castlingRights)
        setSelectedPiecePosition(position)
        setValidMoves(moves)
      }
    },
    [board, currentPlayer, enPassantTarget, castlingRights, isGameActive]
  )

  const isValidMove = useCallback(
    (position: Position): boolean => {
      return validMoves.some((move) => isPositionEqual(move, position))
    },
    [validMoves]
  )

  const handleSquareClick = useCallback(
    (position: Position) => {
      if (!isGameActive) {
        return
      }

      const piece = board[position.x][position.y]

      if (selectedPiecePosition) {
        if (isValidMove(position)) {
          onMoveAttempt(selectedPiecePosition, position)
          return
        }

        if (isPositionEqual(selectedPiecePosition, position)) {
          clearSelection()
          return
        }

        if (piece && piece.color === currentPlayer) {
          selectPiece(position, piece)
          return
        }

        clearSelection()
      } else {
        if (piece && piece.color === currentPlayer) {
          selectPiece(position, piece)
        }
      }
    },
    [board, selectedPiecePosition, currentPlayer, isGameActive, isValidMove, onMoveAttempt, clearSelection, selectPiece]
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent, piece: IChessPiece, position: Position) => {
      if (piece.color !== currentPlayer || !isGameActive) {
        e.preventDefault()
        return
      }

      setDraggedPiece({ piece, from: position })
      selectPiece(position, piece)
    },
    [currentPlayer, isGameActive, selectPiece]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, position: Position) => {
      e.preventDefault()

      if (!draggedPiece) return

      if (isValidMove(position)) {
        onMoveAttempt(draggedPiece.from, position)
      }

      setDraggedPiece(null)
    },
    [draggedPiece, isValidMove, onMoveAttempt]
  )

  const state: PieceInteractionState = {
    selectedPiecePosition,
    validMoves,
    draggedPiece
  }

  const actions: PieceInteractionActions = {
    handleSquareClick,
    handleDragStart,
    handleDragOver,
    handleDrop,
    clearSelection,
    selectPiece,
    isValidMove
  }

  return [state, actions]
}
