import "./Captivity.scss"

import type { ChessPiece } from "../ChessBoard/chessBoard.types"
import ChessPieceComponent from "../ChessBoard/ChessPiece"

export interface CaptivityProps {
  capturedPieces: ChessPiece[]
  className?: string
  scoreDifference?: number
}

function Captivity({ capturedPieces, className = "", scoreDifference }: CaptivityProps) {
  const hasAdvantage = scoreDifference !== undefined && scoreDifference > 0

  return (
    <div className={`captivity ${className}`}>
      <div className="captivity__content">
        <div className="captivity__pieces">
          {capturedPieces.map((piece, index) => (
            <div key={index} className="captivity__piece-container">
              <div className="captivity__piece">
                <ChessPieceComponent piece={piece} />
              </div>
              <span className="captivity__piece-weight">{piece.weight}</span>
            </div>
          ))}
        </div>

        {hasAdvantage && <div className="captivity__advantage">+{scoreDifference}</div>}
      </div>
    </div>
  )
}

export default Captivity
