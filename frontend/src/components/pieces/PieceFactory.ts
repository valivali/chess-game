import { match } from "ts-pattern"

import type { PieceColor, PieceType } from "../ChessBoard/ChessBoard.types"
import { PIECE_TYPE } from "../ChessBoard/ChessBoard.types"
import { Bishop } from "./Bishop"
import { King } from "./King"
import { Knight } from "./Knight"
import { Pawn } from "./Pawn"
import type { IChessPiece } from "./pieces.types"
import { Queen } from "./Queen"
import { Rook } from "./Rook"

export class PieceFactory {
  static createPiece(type: PieceType, color: PieceColor): IChessPiece {
    return match(type)
      .with(PIECE_TYPE.PAWN, () => new Pawn(color))
      .with(PIECE_TYPE.ROOK, () => new Rook(color))
      .with(PIECE_TYPE.KNIGHT, () => new Knight(color))
      .with(PIECE_TYPE.BISHOP, () => new Bishop(color))
      .with(PIECE_TYPE.QUEEN, () => new Queen(color))
      .with(PIECE_TYPE.KING, () => new King(color))
      .exhaustive()
  }

  static createPromotedQueen(color: PieceColor): IChessPiece {
    return new Queen(color)
  }
}
