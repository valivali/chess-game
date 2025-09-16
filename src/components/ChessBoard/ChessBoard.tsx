import "./ChessBoard.scss"

import { memo, useMemo } from "react"

import { useChessGame } from "../../hooks/useChessGame"
import {
  calculateScoreAdvantages,
  getCurrentPlayerDisplayText,
  getGameStatusClassName,
  getGameStatusMessage,
  isGameOver
} from "../../utils/game"
import { getSquareKey, indicesToPosition, isLightSquare, isPositionEqual } from "../../utils/position"
import Captivity from "../Captivity"
import Celebration from "../Celebration"
import ChessSquare from "../ChessSquare"
import { GAME_STATUS } from "./ChessBoard.types.ts"

interface ChessBoardProps {
  className?: string
}

const ChessBoard = memo(({ className = "" }: ChessBoardProps) => {
  const [gameState, gameActions] = useChessGame()

  const scoreAdvantages = useMemo(
    () => calculateScoreAdvantages(gameState.whiteCapturedPieces, gameState.blackCapturedPieces),
    [gameState.whiteCapturedPieces, gameState.blackCapturedPieces]
  )

  const gameStatusMessage = useMemo(
    () => getGameStatusMessage(gameState.gameStatus, gameState.currentPlayer),
    [gameState.gameStatus, gameState.currentPlayer]
  )

  const boardSquares = useMemo(
    () =>
      gameState.board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const position = indicesToPosition(rowIndex, colIndex)
          const isLight = isLightSquare(rowIndex, colIndex)
          const isSelected = gameState.selectedPiecePosition && isPositionEqual(gameState.selectedPiecePosition, position)
          const isValidMove = gameState.validMoves.some((move) => isPositionEqual(move, position))
          const isHighlighted = gameActions.isSquareHighlighted(position)

          return (
            <ChessSquare
              key={getSquareKey(rowIndex, colIndex)}
              piece={piece}
              position={position}
              isLight={isLight}
              isSelected={!!isSelected}
              isValidMove={isValidMove}
              isHighlighted={isHighlighted}
              onClick={gameActions.handleSquareClick}
              onDragStart={gameActions.handleDragStart}
              onDragOver={gameActions.handleDragOver}
              onDrop={gameActions.handleDrop}
            />
          )
        })
      ),
    [gameActions, gameState.board, gameState.selectedPiecePosition, gameState.validMoves]
  )

  return (
    <div className="chess-board-container">
      <div className="chess-board-header">
        {isGameOver(gameState.gameStatus) ? (
          <p className={getGameStatusClassName(gameState.gameStatus)}>{gameStatusMessage}</p>
        ) : (
          <div>
            <p className="chess-board-current-player">
              <span className="chess-board-player-name">{getCurrentPlayerDisplayText(gameState.currentPlayer)}</span>'s turn
            </p>
            {gameState.gameStatus === GAME_STATUS.CHECK && <p className={getGameStatusClassName(GAME_STATUS.CHECK)}>{gameStatusMessage}</p>}
          </div>
        )}
      </div>

      <div className="chess-board-captivity chess-board-captivity--black">
        <Captivity
          capturedPieces={gameState.blackCapturedPieces}
          className="chess-board-captivity-section"
          scoreDifference={scoreAdvantages.blackAdvantage}
        />
      </div>

      <div className={`chess-board ${className}`}>{boardSquares}</div>

      <div className="chess-board-captivity chess-board-captivity--white">
        <Captivity
          capturedPieces={gameState.whiteCapturedPieces}
          className="chess-board-captivity-section"
          scoreDifference={scoreAdvantages.whiteAdvantage}
        />
      </div>

      <div className="chess-board-instructions">
        <p>Click on a piece to select it, then click on a highlighted square to move.</p>
        <p>You can also drag and drop pieces to move them.</p>
      </div>

      {gameState.showCelebration && gameState.winner && (
        <Celebration winner={gameState.winner} onComplete={gameActions.handleCelebrationComplete} />
      )}
    </div>
  )
})

export default ChessBoard
