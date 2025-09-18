import type { IChessPiece } from "../../pieces"

interface ChessPieceProps {
  piece: IChessPiece
  className?: string
}

function ChessPiece({ piece, className = "" }: ChessPieceProps) {
  return piece.render(className)
}

export default ChessPiece
