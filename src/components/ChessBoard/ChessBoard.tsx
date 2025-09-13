import "./ChessBoard.scss"

import React, { useCallback, useState } from "react"

import {
  createInitialBoard,
  getLegalMoves,
  isCheckmate,
  isEnPassantCapture,
  isInCheck,
  isPositionEqual,
  isStalemate
} from "../../utils/chess"
import Celebration from "../Celebration"
import ChessSquare from "../ChessSquare"
import type { ChessBoard as ChessBoardType, ChessPiece as ChessPieceType, GameStatus, PieceColor, Position } from "./types"
import { GAME_STATUS } from "./types"

interface ChessBoardProps {
  className?: string
}

function ChessBoard({ className = "" }: ChessBoardProps) {
  const [board, setBoard] = useState<ChessBoardType>(createInitialBoard)
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [draggedPiece, setDraggedPiece] = useState<{ piece: ChessPieceType; from: Position } | null>(null)
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null)
  const [gameStatus, setGameStatus] = useState<GameStatus>(GAME_STATUS.PLAYING)
  const [showCelebration, setShowCelebration] = useState(false)
  const [winner, setWinner] = useState<PieceColor | null>(null)

  const getGameStatusClassName = (status: GameStatus): string => {
    return `chess-board-game-status chess-board-game-status--${status}`
  }

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
    setBoard(createInitialBoard())
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentPlayer("white")
    setDraggedPiece(null)
    setEnPassantTarget(null)
    setGameStatus(GAME_STATUS.PLAYING)
    setWinner(null)
  }, [])

  const makeMove = useCallback(
    (from: Position, to: Position) => {
      const newBoard = board.map((row) => [...row])
      const piece = newBoard[from.x][from.y]
      const capturedPiece = newBoard[to.x][to.y]

      if (!piece) return

      const isEnPassant = isEnPassantCapture(piece, from, to, enPassantTarget)

      if (isEnPassant) {
        newBoard[from.x][to.y] = null
      }

      // Move the piece
      newBoard[to.x][to.y] = piece
      newBoard[from.x][from.y] = null

      let newEnPassantTarget: Position | null = null
      if (piece.type === "pawn" && Math.abs(to.x - from.x) === 2) {
        newEnPassantTarget = {
          x: from.x + (to.x - from.x) / 2,
          y: from.y
        }
      }

      const nextPlayer = currentPlayer === "white" ? "black" : "white"

      setBoard(newBoard)
      setSelectedSquare(null)
      setValidMoves([])
      setCurrentPlayer(nextPlayer)
      setEnPassantTarget(newEnPassantTarget)

      // Check game status after the move
      const nextPlayerInCheck = isInCheck(newBoard, nextPlayer)
      const nextPlayerCheckmate = isCheckmate(newBoard, nextPlayer, newEnPassantTarget)
      const nextPlayerStalemate = isStalemate(newBoard, nextPlayer, newEnPassantTarget)

      let newGameStatus: GameStatus = GAME_STATUS.PLAYING

      if (nextPlayerCheckmate) {
        newGameStatus = GAME_STATUS.CHECKMATE
        setWinner(currentPlayer)
        setShowCelebration(true)
        console.log(`Checkmate! ${currentPlayer} wins!`)
      } else if (nextPlayerStalemate) {
        newGameStatus = GAME_STATUS.STALEMATE
        console.log("Stalemate! The game is a draw.")
      } else if (nextPlayerInCheck) {
        newGameStatus = GAME_STATUS.CHECK
        console.log(`${nextPlayer} is in check!`)
      }

      setGameStatus(newGameStatus)

      // Log move for now (could be replaced with toast notifications later)
      if (isEnPassant) {
        // Already logged above
      } else if (capturedPiece) {
        console.log(`${piece.color} captures ${capturedPiece.type}!`)
      } else {
        console.log(`${piece.color} ${piece.type} moves`)
      }
    },
    [board, currentPlayer, enPassantTarget]
  )

  const handleSquareClick = useCallback(
    (position: Position) => {
      // Prevent moves if game is over
      if (gameStatus === GAME_STATUS.CHECKMATE || gameStatus === GAME_STATUS.STALEMATE) {
        return
      }

      const piece = board[position.x][position.y]

      // If a square is already selected
      if (selectedSquare) {
        // If clicking on a valid move
        if (validMoves.some((move) => isPositionEqual(move, position))) {
          makeMove(selectedSquare, position)
          return
        }

        // If clicking on the same square, deselect
        if (isPositionEqual(selectedSquare, position)) {
          setSelectedSquare(null)
          setValidMoves([])
          return
        }

        // If clicking on another piece of the same color, select it
        if (piece && piece.color === currentPlayer) {
          const moves = getLegalMoves(piece, position, board, enPassantTarget)
          setSelectedSquare(position)
          setValidMoves(moves)
          return
        }

        // Otherwise, deselect
        setSelectedSquare(null)
        setValidMoves([])
      } else {
        // No square selected, select if it's current player's piece
        if (piece && piece.color === currentPlayer) {
          const moves = getLegalMoves(piece, position, board, enPassantTarget)
          setSelectedSquare(position)
          setValidMoves(moves)
        }
      }
    },
    [board, selectedSquare, validMoves, currentPlayer, makeMove, enPassantTarget, gameStatus]
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent, piece: ChessPieceType, position: Position) => {
      if (piece.color !== currentPlayer || gameStatus === GAME_STATUS.CHECKMATE || gameStatus === GAME_STATUS.STALEMATE) {
        e.preventDefault()
        return
      }

      setDraggedPiece({ piece, from: position })
      setSelectedSquare(position)
      setValidMoves(getLegalMoves(piece, position, board, enPassantTarget))
    },
    [currentPlayer, board, enPassantTarget, gameStatus]
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
        <h2 className="chess-board-title">Chess Game</h2>
        {gameStatus === GAME_STATUS.CHECKMATE ? (
          <p className={getGameStatusClassName(GAME_STATUS.CHECKMATE)}>Checkmate! {currentPlayer === "white" ? "Black" : "White"} wins!</p>
        ) : gameStatus === GAME_STATUS.STALEMATE ? (
          <p className={getGameStatusClassName(GAME_STATUS.STALEMATE)}>Stalemate! The game is a draw.</p>
        ) : (
          <div>
            <p className="chess-board-current-player">
              Current Player: <span className="chess-board-player-name">{currentPlayer}</span>
            </p>
            {gameStatus === GAME_STATUS.CHECK && <p className={getGameStatusClassName(GAME_STATUS.CHECK)}>{currentPlayer} is in check!</p>}
          </div>
        )}
      </div>

      <div className={`chess-board ${className}`}>
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position = { x: rowIndex, y: colIndex }
            const isLight = (rowIndex + colIndex) % 2 === 0
            const isSelected = selectedSquare && isPositionEqual(selectedSquare, position)
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

      <div className="chess-board-instructions">
        <p>Click on a piece to select it, then click on a highlighted square to move.</p>
        <p>You can also drag and drop pieces to move them.</p>
      </div>

      {/* Celebration overlay */}
      {showCelebration && winner && <Celebration winner={winner} onComplete={handleCelebrationComplete} />}
    </div>
  )
}

export default ChessBoard
