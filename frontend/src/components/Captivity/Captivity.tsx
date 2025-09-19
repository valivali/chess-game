import "./Captivity.scss"

import type { IChessPiece } from "../pieces"
import { ChessPiece as ChessPieceComponent } from "../ui/chess-piece"

export interface CaptivityProps {
  capturedPieces: IChessPiece[]
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
