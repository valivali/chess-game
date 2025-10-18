import "./GameHistoryTable.scss"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { match } from "ts-pattern"

import { HistoryIcon } from "../../assets/icons"
import type { PaginationInfo } from "../../types"
import { formatDateForDisplay, formatDuration } from "../../utils/date-time"
import type { GameEndReason, GameResult, PieceColor } from "../ChessBoard/ChessBoard.types"
import { GAME_END_REASON, PIECE_COLOR } from "../ChessBoard/ChessBoard.types"
import { Badge } from "../ui/badge"
import { EmptyState } from "../ui/empty-state"
import { Pagination } from "../ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSkeleton } from "../ui/table"

interface HistoryGameData {
  id: string
  opponentName: string
  result: GameResult
  endReason: GameEndReason
  moveCount: number
  duration: number // in minutes
  completedAt: Date
  userColor: PieceColor
}

interface GameHistoryTableProps {
  games: HistoryGameData[]
  isLoading: boolean
  onNewGame: () => void
  isCreatingGame?: boolean
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
}

const HISTORY_MOTIVATION_TEXTS = [
  "Learn from the past, dominate the future! 📚",
  "Every game is a lesson. Time for a new chapter! 🎓",
  "History shows your progress. Ready for the next victory? 🏆",
  "Past games are stepping stones to mastery! 🪜",
  "Your chess journey awaits its next chapter! 📖",
  "Champions are made from analyzing their games! 🔍",
  "The best players learn from every move. Your turn! ♟️"
]

const getRandomHistoryMotivation = (): string => {
  return HISTORY_MOTIVATION_TEXTS[Math.floor(Math.random() * HISTORY_MOTIVATION_TEXTS.length)]
}

const ResultBadge: React.FC<{ result: GameResult; userColor: PieceColor }> = ({ result, userColor }) => (
  <div className="result-badge">
    <Badge className={`badge--${result}`} size="sm">
      {result.toUpperCase()}
    </Badge>
    <span className="result-badge__color">{userColor === PIECE_COLOR.WHITE ? "⚪" : "⚫"}</span>
  </div>
)

const EndReasonBadge: React.FC<{ reason: GameEndReason }> = ({ reason }) => {
  const reasonText = match(reason)
    .with(GAME_END_REASON.CHECKMATE, () => "♔ Checkmate")
    .with(GAME_END_REASON.STALEMATE, () => "⚖️ Stalemate")
    .with(GAME_END_REASON.DRAW, () => "🤝 Draw")
    .with(GAME_END_REASON.RESIGNATION, () => "🏳️ Resignation")
    .with(GAME_END_REASON.TIMEOUT, () => "⏰ Timeout")
    .exhaustive()

  return (
    <Badge className={`badge--end-reason badge--${reason}-reason`} size="sm">
      {reasonText}
    </Badge>
  )
}

const GameHistoryTable: React.FC<GameHistoryTableProps> = ({
  games,
  isLoading,
  onNewGame,
  isCreatingGame = false,
  pagination,
  onPageChange
}) => {
  const navigate = useNavigate()

  const handleGameClick = (gameId: string) => {
    // Navigate to game review/replay mode
    navigate(`/game/${gameId}?mode=review`)
  }

  if (isLoading) {
    return (
      <div className="game-history-table">
        <div className="game-history-table__header">
          <h2 className="game-history-table__title">Game History</h2>
        </div>
        <TableSkeleton rows={5} columns={6} />
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="game-history-table">
        <div className="game-history-table__header">
          <h2 className="game-history-table__title">Game History</h2>
        </div>
        <EmptyState
          icon={<HistoryIcon />}
          title="No game history"
          description="You haven't completed any games yet. Start playing to build your chess history and track your progress!"
          motivationText={getRandomHistoryMotivation()}
          actionLabel="🎮 Start First Game"
          onAction={onNewGame}
          isLoading={isCreatingGame}
        />
      </div>
    )
  }

  const winCount = games.filter((game) => game.result === "win").length
  const lossCount = games.filter((game) => game.result === "loss").length
  const drawCount = games.filter((game) => game.result === "draw").length

  return (
    <div className="game-history-table">
      <div className="game-history-table__header">
        <h2 className="game-history-table__title">Game History</h2>
        <div className="game-history-table__stats">
          <span className="game-history-table__stat game-history-table__stat--wins">{winCount}W</span>
          <span className="game-history-table__stat game-history-table__stat--losses">{lossCount}L</span>
          <span className="game-history-table__stat game-history-table__stat--draws">{drawCount}D</span>
          {pagination && <span className="game-history-table__total">{pagination.total} total</span>}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Game ID</TableHead>
            <TableHead>Opponent</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>End Reason</TableHead>
            <TableHead>Moves</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow key={game.id} className="table__row--clickable" onClick={() => handleGameClick(game.id)}>
              <TableCell className="game-history-table__game-id">#{game.id.slice(-8).toUpperCase()}</TableCell>
              <TableCell>
                <div className="game-history-table__opponent">
                  <span className="game-history-table__opponent-name">{game.opponentName}</span>
                  <span className="game-history-table__user-color">You: {game.userColor === PIECE_COLOR.WHITE ? "⚪" : "⚫"}</span>
                </div>
              </TableCell>
              <TableCell>
                <ResultBadge result={game.result} userColor={game.userColor} />
              </TableCell>
              <TableCell>
                <EndReasonBadge reason={game.endReason} />
              </TableCell>
              <TableCell>{game.moveCount}</TableCell>
              <TableCell className="game-history-table__duration">{formatDuration(game.duration)}</TableCell>
              <TableCell className="game-history-table__date">{formatDateForDisplay(game.completedAt)}</TableCell>
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

export { GameHistoryTable }
export type { HistoryGameData }
