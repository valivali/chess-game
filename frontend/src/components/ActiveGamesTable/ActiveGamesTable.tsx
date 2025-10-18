import "./ActiveGamesTable.scss"

import * as React from "react"
import { useNavigate } from "react-router-dom"

import { ChessIcon } from "../../assets/icons"
import type { PaginationInfo } from "../../types"
import { formatTimeAgo } from "../../utils/date-time"
import type { GameStatus, PieceColor } from "../ChessBoard/ChessBoard.types"
import { PIECE_COLOR } from "../ChessBoard/ChessBoard.types"
import { Badge } from "../ui/badge"
import { EmptyState } from "../ui/empty-state"
import { Pagination } from "../ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSkeleton } from "../ui/table"

interface GameData {
  id: string
  opponentName: string
  moveCount: number
  currentPlayer: PieceColor
  status: GameStatus
  lastMove: Date
  userColor: PieceColor
}

interface ActiveGamesTableProps {
  games: GameData[]
  isLoading: boolean
  onNewGame: () => void
  isCreatingGame?: boolean
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
}

const MOTIVATION_TEXTS = [
  "Every master was once a beginner. Start your journey! ♟️",
  "The best time to play chess was yesterday. The second best time is now! 🏆",
  "A game of chess is like a sword fight. You must think first before you move! ⚔️",
  "Chess is the gymnasium of the mind. Time for a workout! 💪",
  "In chess, as in life, opportunity strikes but once. Seize it! ⚡",
  "The pawns are the soul of chess. Let's give them life! 👑",
  "Chess is mental torture. But the good kind! 🧠",
  "Every chess master was once a beginner. Your turn to begin! 🌟"
]

const getRandomMotivation = (): string => {
  return MOTIVATION_TEXTS[Math.floor(Math.random() * MOTIVATION_TEXTS.length)]
}

const StatusBadge: React.FC<{ status: GameStatus }> = ({ status }) => (
  <Badge className={`badge--${status}`} size="sm">
    {status}
  </Badge>
)

const TurnIndicator: React.FC<{ currentPlayer: PieceColor; userColor: PieceColor }> = ({ currentPlayer, userColor }) => {
  const isUserTurn = currentPlayer === userColor

  return (
    <div className="turn-indicator">
      <div className={`turn-indicator__dot turn-indicator__dot--${currentPlayer}`} />
      <span className={isUserTurn ? "turn-indicator--your-turn" : ""}>
        {isUserTurn ? "Your turn" : `${currentPlayer === PIECE_COLOR.WHITE ? "White" : "Black"}'s turn`}
      </span>
    </div>
  )
}

const ActiveGamesTable: React.FC<ActiveGamesTableProps> = ({
  games,
  isLoading,
  onNewGame,
  isCreatingGame = false,
  pagination,
  onPageChange
}) => {
  const navigate = useNavigate()

  const handleGameClick = (gameId: string) => {
    navigate(`/game/${gameId}`)
  }

  if (isLoading) {
    return (
      <div className="active-games-table">
        <div className="active-games-table__header">
          <h2 className="active-games-table__title">Active Games</h2>
        </div>
        <TableSkeleton rows={3} columns={5} />
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="active-games-table">
        <div className="active-games-table__header">
          <h2 className="active-games-table__title">Active Games</h2>
        </div>
        <EmptyState
          icon={<ChessIcon />}
          title="No active games"
          description="You don't have any active games at the moment. Start a new game and challenge yourself!"
          motivationText={getRandomMotivation()}
          actionLabel="🎮 Start New Game"
          onAction={onNewGame}
          isLoading={isCreatingGame}
        />
      </div>
    )
  }

  return (
    <div className="active-games-table">
      <div className="active-games-table__header">
        <h2 className="active-games-table__title">Active Games</h2>
        <span className="active-games-table__count">
          {pagination
            ? `${pagination.total} game${pagination.total !== 1 ? "s" : ""}`
            : `${games.length} game${games.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Game ID</TableHead>
            <TableHead>Opponent</TableHead>
            <TableHead>Moves</TableHead>
            <TableHead>Turn</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow key={game.id} className="table__row--clickable" onClick={() => handleGameClick(game.id)}>
              <TableCell className="active-games-table__game-id">#{game.id.slice(-8).toUpperCase()}</TableCell>
              <TableCell>
                <div className="active-games-table__opponent">
                  <span className="active-games-table__opponent-name">{game.opponentName}</span>
                  <span className="active-games-table__user-color">You: {game.userColor === PIECE_COLOR.WHITE ? "⚪" : "⚫"}</span>
                </div>
              </TableCell>
              <TableCell>{game.moveCount}</TableCell>
              <TableCell>
                <TurnIndicator currentPlayer={game.currentPlayer} userColor={game.userColor} />
              </TableCell>
              <TableCell>
                <StatusBadge status={game.status} />
              </TableCell>
              <TableCell className="active-games-table__last-move">{formatTimeAgo(game.lastMove)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && onPageChange && (
        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} isLoading={isLoading} />
      )}
    </div>
  )
}

export { ActiveGamesTable }
export type { GameData }
