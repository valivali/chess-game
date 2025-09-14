import "./ChessBoard.scss"

import React, { useCallback, useMemo, useState } from "react"

import {
  createInitialBoard,
  createInitialCastlingRights,
  getCastlingSide,
  getLegalMoves,
  isCastlingMove,
  isCheckmate,
  isEnPassantCapture,
  isInCheck,
  isPositionEqual,
  isStalemate,
  updateCastlingRights
} from "../../utils/chess"
import Captivity from "../Captivity"
import Celebration from "../Celebration"
import ChessSquare from "../ChessSquare"
import type {
  CastlingRights,
  ChessBoard as ChessBoardType,
  ChessPiece as ChessPieceType,
  GameStatus,
  PieceColor,
  Position
} from "./chessBoard.types"
import { CASTLING_SIDE, GAME_STATUS } from "./chessBoard.types"

interface ChessBoardProps {
  className?: string
}

function ChessBoard({ className = "" }: ChessBoardProps) {
  const [board, setBoard] = useState<ChessBoardType>(createInitialBoard)
  const [selectedPiecePosition, setSelectedPiecePosition] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [draggedPiece, setDraggedPiece] = useState<{ piece: ChessPieceType; from: Position } | null>(null)
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null)
  const [gameStatus, setGameStatus] = useState<GameStatus>(GAME_STATUS.PLAYING)
  const [showCelebration, setShowCelebration] = useState(false)
  const [winner, setWinner] = useState<PieceColor | null>(null)
  const [whiteCapturedPieces, setWhiteCapturedPieces] = useState<ChessPieceType[]>([])
  const [blackCapturedPieces, setBlackCapturedPieces] = useState<ChessPieceType[]>([])
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(createInitialCastlingRights)

  const scoreAdvantages = useMemo(() => {
    const whiteScore = whiteCapturedPieces.reduce((sum, piece) => sum + piece.weight, 0)
    const blackScore = blackCapturedPieces.reduce((sum, piece) => sum + piece.weight, 0)
    const whiteDifference = whiteScore - blackScore
    const blackDifference = blackScore - whiteScore

    return {
      whiteAdvantage: whiteDifference > 0 ? whiteDifference : undefined,
      blackAdvantage: blackDifference > 0 ? blackDifference : undefined
    }
  }, [whiteCapturedPieces, blackCapturedPieces])

  const getGameStatusClassName = (status: GameStatus): string => {
    return `chess-board-game-status chess-board-game-status--${status}`
  }

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
    setBoard(createInitialBoard())
    setSelectedPiecePosition(null)
    setValidMoves([])
    setCurrentPlayer("white")
    setDraggedPiece(null)
    setEnPassantTarget(null)
    setGameStatus(GAME_STATUS.PLAYING)
    setWinner(null)
    setWhiteCapturedPieces([])
    setBlackCapturedPieces([])
    setCastlingRights(createInitialCastlingRights())
  }, [])

  const makeMove = useCallback(
    (from: Position, to: Position) => {
      const newBoard = board.map((row) => [...row])
      const piece = newBoard[from.x][from.y]

      if (!piece) return

      const isCastling = isCastlingMove(from, to, piece)
      const isEnPassant = isEnPassantCapture(piece, from, to, enPassantTarget)
      let capturedPiece: ChessPieceType | null = null

      if (isCastling) {
        // Handle castling move
        const side = getCastlingSide(from, to)
        const kingRow = piece.color === "white" ? 7 : 0
        const rookFromCol = side === CASTLING_SIDE.KINGSIDE ? 7 : 0
        const rookToCol = side === CASTLING_SIDE.KINGSIDE ? 5 : 3

        // Move king
        newBoard[to.x][to.y] = piece
        newBoard[from.x][from.y] = null

        // Move rook
        const rook = newBoard[kingRow][rookFromCol]
        if (rook) {
          newBoard[kingRow][rookToCol] = rook
          newBoard[kingRow][rookFromCol] = null
        }
      } else {
        // Handle regular move or en passant
        capturedPiece = isEnPassant ? newBoard[from.x][to.y] : newBoard[to.x][to.y]

        if (isEnPassant) {
          newBoard[from.x][to.y] = null
        }

        newBoard[to.x][to.y] = piece
        newBoard[from.x][from.y] = null
      }

      const newWhiteCaptured =
        capturedPiece && currentPlayer === "white"
          ? [...whiteCapturedPieces, capturedPiece].sort((a, b) => b.weight - a.weight)
          : whiteCapturedPieces

      const newBlackCaptured =
        capturedPiece && currentPlayer === "black"
          ? [...blackCapturedPieces, capturedPiece].sort((a, b) => b.weight - a.weight)
          : blackCapturedPieces

      const newEnPassantTarget: Position | null =
        piece.type === "pawn" && Math.abs(to.x - from.x) === 2
          ? {
              x: from.x + (to.x - from.x) / 2,
              y: from.y
            }
          : null

      // Update castling rights
      const newCastlingRights = updateCastlingRights(castlingRights, from, piece)

      const nextPlayer = currentPlayer === "white" ? "black" : "white"

      setBoard(newBoard)
      setSelectedPiecePosition(null)
      setValidMoves([])
      setCurrentPlayer(nextPlayer)
      setEnPassantTarget(newEnPassantTarget)
      setWhiteCapturedPieces(newWhiteCaptured)
      setBlackCapturedPieces(newBlackCaptured)
      setCastlingRights(newCastlingRights)

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
    [board, currentPlayer, enPassantTarget, whiteCapturedPieces, blackCapturedPieces, castlingRights]
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
      return validMoves.some((move) => isPositionEqual(move, position))
    },
    [validMoves]
  )

  return (
    <div className="chess-board-container">
      <div className="chess-board-header">
        {gameStatus === GAME_STATUS.CHECKMATE ? (
          <p className={getGameStatusClassName(GAME_STATUS.CHECKMATE)}>Checkmate! {currentPlayer === "white" ? "Black" : "White"} wins!</p>
        ) : gameStatus === GAME_STATUS.STALEMATE ? (
          <p className={getGameStatusClassName(GAME_STATUS.STALEMATE)}>Stalemate! The game is a draw.</p>
        ) : (
          <div>
            <p className="chess-board-current-player">
              <span className="chess-board-player-name">{currentPlayer === "white" ? "White" : "Black"}</span>'s turn
            </p>
            {gameStatus === GAME_STATUS.CHECK && <p className={getGameStatusClassName(GAME_STATUS.CHECK)}>{currentPlayer} is in check!</p>}
          </div>
        )}
      </div>

      <div className="chess-board-captivity chess-board-captivity--black">
        <Captivity
          capturedPieces={blackCapturedPieces}
          className="chess-board-captivity-section"
          scoreDifference={scoreAdvantages.blackAdvantage}
        />
      </div>

      <div className={`chess-board ${className}`}>
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position = { x: rowIndex, y: colIndex }
            const isLight = (rowIndex + colIndex) % 2 === 0
            const isSelected = selectedPiecePosition && isPositionEqual(selectedPiecePosition, position)
            const isValidMove = validMoves.some((move) => isPositionEqual(move, position))
            const isHighlighted = isSquareHighlighted(position)

            return (
              <ChessSquare
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                position={position}
                isLight={isLight}
                isSelected={!!isSelected}
                isValidMove={isValidMove}
                isHighlighted={isHighlighted}
                onClick={handleSquareClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            )
          })
        )}
      </div>

      <div className="chess-board-captivity chess-board-captivity--white">
        <Captivity
          capturedPieces={whiteCapturedPieces}
          className="chess-board-captivity-section"
          scoreDifference={scoreAdvantages.whiteAdvantage}
        />
      </div>

      <div className="chess-board-instructions">
        <p>Click on a piece to select it, then click on a highlighted square to move.</p>
        <p>You can also drag and drop pieces to move them.</p>
      </div>

      {showCelebration && winner && <Celebration winner={winner} onComplete={handleCelebrationComplete} />}
    </div>
  )
}

export default ChessBoard
