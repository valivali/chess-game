import { useCallback, useState } from "react"

import { GAME_STATUS, PIECE_COLOR } from "../../components/ChessBoard"
import type {
  CastlingRights,
  ChessBoard as ChessBoardType,
  GameStatus,
  Move,
  PieceColor,
  Position
} from "../../components/ChessBoard/ChessBoard.types"
import type { IChessPiece } from "../../components/pieces"
import { createInitialBoard } from "../../utils/board"
import { createInitialCastlingRights } from "../../utils/moves"

export interface GameState {
  board: ChessBoardType
  currentPlayer: PieceColor
  enPassantTarget: Position | null
  gameStatus: GameStatus
  winner: PieceColor | null
  whiteCapturedPieces: IChessPiece[]
  blackCapturedPieces: IChessPiece[]
  castlingRights: CastlingRights
  lastMove: Move | null
}

export interface GameStateActions {
  setBoard: (board: ChessBoardType) => void
  setCurrentPlayer: (player: PieceColor) => void
  setEnPassantTarget: (target: Position | null) => void
  setGameStatus: (status: GameStatus) => void
  setWinner: (winner: PieceColor | null) => void
  setWhiteCapturedPieces: (pieces: IChessPiece[]) => void
  setBlackCapturedPieces: (pieces: IChessPiece[]) => void
  setCastlingRights: (rights: CastlingRights) => void
  setLastMove: (move: Move | null) => void
  resetGame: () => void
  switchPlayer: () => void
  addCapturedPiece: (piece: IChessPiece, capturedBy: PieceColor) => void
}

export const useGameState = (): [GameState, GameStateActions] => {
  const [board, setBoard] = useState<ChessBoardType>(createInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>(PIECE_COLOR.WHITE)
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null)
  const [gameStatus, setGameStatus] = useState<GameStatus>(GAME_STATUS.PLAYING)
  const [winner, setWinner] = useState<PieceColor | null>(null)
  const [whiteCapturedPieces, setWhiteCapturedPieces] = useState<IChessPiece[]>([])
  const [blackCapturedPieces, setBlackCapturedPieces] = useState<IChessPiece[]>([])
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(createInitialCastlingRights)
  const [lastMove, setLastMove] = useState<Move | null>(null)

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard())
    setCurrentPlayer(PIECE_COLOR.WHITE)
    setEnPassantTarget(null)
    setGameStatus(GAME_STATUS.PLAYING)
    setWinner(null)
    setWhiteCapturedPieces([])
    setBlackCapturedPieces([])
    setCastlingRights(createInitialCastlingRights())
    setLastMove(null)
  }, [])

  const switchPlayer = useCallback(() => {
    setCurrentPlayer((current) => (current === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE))
  }, [])

  const addCapturedPiece = useCallback((piece: IChessPiece, capturedBy: PieceColor) => {
    if (capturedBy === PIECE_COLOR.WHITE) {
      setWhiteCapturedPieces((current) => [...current, piece].sort((a, b) => b.weight - a.weight))
    } else {
      setBlackCapturedPieces((current) => [...current, piece].sort((a, b) => b.weight - a.weight))
    }
  }, [])

  const gameState: GameState = {
    board,
    currentPlayer,
    enPassantTarget,
    gameStatus,
    winner,
    whiteCapturedPieces,
    blackCapturedPieces,
    castlingRights,
    lastMove
  }

  const gameStateActions: GameStateActions = {
    setBoard,
    setCurrentPlayer,
    setEnPassantTarget,
    setGameStatus,
    setWinner,
    setWhiteCapturedPieces,
    setBlackCapturedPieces,
    setCastlingRights,
    setLastMove,
    resetGame,
    switchPlayer,
    addCapturedPiece
  }

  return [gameState, gameStateActions]
}
