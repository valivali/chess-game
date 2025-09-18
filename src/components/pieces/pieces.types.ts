import type { CastlingRights, ChessBoard, PieceColor, PieceType, Position } from "../ChessBoard/ChessBoard.types"

export interface MoveContext {
  enPassantTarget?: Position | null
  castlingRights?: CastlingRights
}

export interface MoveResult {
  capturedPiece: IChessPiece | null
  newEnPassantTarget: Position | null
}

export interface IChessPiece {
  readonly type: PieceType
  readonly color: PieceColor
  readonly weight: number

  getValidMoves(position: Position, board: ChessBoard, context?: MoveContext): Position[]

  executeMove(from: Position, to: Position, board: ChessBoard, context?: MoveContext): MoveResult

  canMoveTo(from: Position, to: Position, board: ChessBoard, context?: MoveContext): boolean

  clone(): IChessPiece
}
