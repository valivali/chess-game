import React, { useCallback } from "react"

import type {
  CastlingRights,
  ChessBoard as ChessBoardType,
  GameStatus,
  Move,
  PieceColor,
  Position
} from "../../components/ChessBoard/ChessBoard.types"
import type { IChessPiece } from "../../components/pieces"
import { updateCastlingRights } from "../../utils/moves"
import { useGameState } from "../useGameState"
import { useGameStatus } from "../useGameStatus"
import { useMoveLogic } from "../useMoveLogic"
import { usePieceInteraction } from "../usePieceInteraction"
import { useUIState } from "../useUIState"

export interface ChessGameState {
  board: ChessBoardType
  selectedPiecePosition: Position | null
  validMoves: Position[]
  currentPlayer: PieceColor
  draggedPiece: { piece: IChessPiece; from: Position } | null
  enPassantTarget: Position | null
  gameStatus: GameStatus
  showCelebration: boolean
  winner: PieceColor | null
  whiteCapturedPieces: IChessPiece[]
  blackCapturedPieces: IChessPiece[]
  castlingRights: CastlingRights
  lastMove: Move | null
}

export interface ChessGameActions {
  makeMove: (from: Position, to: Position) => void
  handleSquareClick: (position: Position) => void
  handleDragStart: (e: React.DragEvent, piece: IChessPiece, position: Position) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, position: Position) => void
  handleCelebrationComplete: () => void
  isSquareHighlighted: (position: Position) => boolean
}

export const useChessGame = (): [ChessGameState, ChessGameActions] => {
  const [gameState, gameStateActions] = useGameState()

  const { executePieceMove, createBoardCopy } = useMoveLogic()

  const { checkForGameEnd } = useGameStatus()

  const [uiState, uiStateActions] = useUIState({
    onGameReset: gameStateActions.resetGame
  })

  const makeMove = useCallback(
    (from: Position, to: Position) => {
      const newBoard = createBoardCopy(gameState.board)
      const piece = newBoard[from.x][from.y]

      if (!piece) return

      const { capturedPiece, newEnPassantTarget } = executePieceMove(piece, from, to, newBoard, gameState.enPassantTarget)

      if (capturedPiece) {
        gameStateActions.addCapturedPiece(capturedPiece, gameState.currentPlayer)
      }

      const newCastlingRights = updateCastlingRights(gameState.castlingRights, from, piece)

      gameStateActions.setBoard(newBoard)
      gameStateActions.setEnPassantTarget(newEnPassantTarget)
      gameStateActions.setCastlingRights(newCastlingRights)
      gameStateActions.setLastMove({ from, to })
      uiStateActions.setLastMove({ from, to })

      gameStateActions.switchPlayer()
      const nextPlayer = gameState.currentPlayer === "white" ? "black" : "white"

      const { status, isGameOver, winner } = checkForGameEnd(newBoard, nextPlayer, newEnPassantTarget, newCastlingRights)

      gameStateActions.setGameStatus(status)

      if (isGameOver && winner) {
        gameStateActions.setWinner(winner)
        uiStateActions.setShowCelebration(true)
      }
    },
    [gameState, gameStateActions, uiStateActions, executePieceMove, createBoardCopy, checkForGameEnd]
  )

  const [pieceInteractionState, pieceInteractionActions] = usePieceInteraction({
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    gameStatus: gameState.gameStatus,
    enPassantTarget: gameState.enPassantTarget,
    castlingRights: gameState.castlingRights,
    onMoveAttempt: makeMove
  })

  const combinedState: ChessGameState = {
    board: gameState.board,
    selectedPiecePosition: pieceInteractionState.selectedPiecePosition,
    validMoves: pieceInteractionState.validMoves,
    currentPlayer: gameState.currentPlayer,
    draggedPiece: pieceInteractionState.draggedPiece,
    enPassantTarget: gameState.enPassantTarget,
    gameStatus: gameState.gameStatus,
    showCelebration: uiState.showCelebration,
    winner: gameState.winner,
    whiteCapturedPieces: gameState.whiteCapturedPieces,
    blackCapturedPieces: gameState.blackCapturedPieces,
    castlingRights: gameState.castlingRights,
    lastMove: gameState.lastMove
  }

  const combinedActions: ChessGameActions = {
    makeMove,
    handleSquareClick: pieceInteractionActions.handleSquareClick,
    handleDragStart: pieceInteractionActions.handleDragStart,
    handleDragOver: pieceInteractionActions.handleDragOver,
    handleDrop: pieceInteractionActions.handleDrop,
    handleCelebrationComplete: uiStateActions.handleCelebrationComplete,
    isSquareHighlighted: uiStateActions.isSquareHighlighted
  }

  return [combinedState, combinedActions]
}
