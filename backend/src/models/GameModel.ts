import { Document, model, Schema } from 'mongoose'
import { Game, PieceType } from '@/types/gameTypes'

export interface GameDocument extends Omit<Game, 'id'>, Document {
  _id: string
}

const gameSchema = new Schema<GameDocument>(
  {
    board: {
      type: [[Schema.Types.Mixed]],
      required: true,
      validate: {
        validator: (board: (PieceType | null)[][]) => {
          return (
            Array.isArray(board) &&
            board.length === 8 &&
            board.every(row => Array.isArray(row) && row.length === 8)
          )
        },
        message: 'Board must be an 8x8 array'
      }
    },
    currentPlayer: {
      type: String,
      required: true,
      enum: ['white', 'black']
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'checkmate', 'stalemate', 'draw']
    },
    winner: {
      type: String,
      enum: ['white', 'black'],
      default: null
    },
    whitePlayerId: {
      type: String,
      default: null
    },
    blackPlayerId: {
      type: String,
      default: null
    },
    playerName: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        const { _id, __v, ...cleanRet } = ret
        return { id: ret.id, ...cleanRet }
      }
    }
  }
)

export const GameModel = model<GameDocument>('Game', gameSchema)
