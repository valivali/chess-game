import { Bishop, King, Knight, Pawn, Queen, Rook } from "../../assets/pieces"
import type { ChessPiece as ChessPieceType } from "./ChessBoard.types"
import { PIECE_TYPE } from "./ChessBoard.types"

interface ChessPieceProps {
  piece: ChessPieceType
  className?: string
}

function ChessPiece({ piece, className = "" }: ChessPieceProps) {
  const commonProps = {
    color: piece.color,
    className: `chess-piece-svg ${className}`
  }

  switch (piece.type) {
    case PIECE_TYPE.KING:
      return <King {...commonProps} />
    case PIECE_TYPE.QUEEN:
      return <Queen {...commonProps} />
    case PIECE_TYPE.ROOK:
      return <Rook {...commonProps} />
    case PIECE_TYPE.BISHOP:
      return <Bishop {...commonProps} />
    case PIECE_TYPE.KNIGHT:
      return <Knight {...commonProps} />
    case PIECE_TYPE.PAWN:
      return <Pawn {...commonProps} />
    default:
      return null
  }
}

export default ChessPiece
