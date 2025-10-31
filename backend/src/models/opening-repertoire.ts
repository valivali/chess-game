import { Document, model, Schema } from "mongoose"
import { OpeningRepertoire } from "@/types/opening-types"

export interface OpeningRepertoireDocument extends Omit<OpeningRepertoire, "id">, Document {
  _id: string
}

const openingMoveSchema = new Schema(
  {
    san: { type: String, required: true },
    from: {
      x: { type: Number, required: true, min: 0, max: 7 },
      y: { type: Number, required: true, min: 0, max: 7 }
    },
    to: {
      x: { type: Number, required: true, min: 0, max: 7 },
      y: { type: Number, required: true, min: 0, max: 7 }
    },
    uci: { type: String, required: true },
    captured: { type: String },
    promotion: { type: String },
    castling: { type: String, enum: ["kingside", "queenside"] },
    enPassant: { type: Boolean }
  },
  { _id: false }
)

const openingNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    move: { type: openingMoveSchema, default: null },
    fen: { type: String, required: true },
    comment: { type: String },
    evaluation: { type: Number },
    isMainLine: { type: Boolean, required: true, default: false },
    priority: { type: Number, required: true, min: 1, max: 10, default: 5 },
    children: { type: [Schema.Types.Mixed], default: [] }, // Self-referencing
    stats: {
      games: { type: Number, default: 0 },
      whiteWins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      blackWins: { type: Number, default: 0 }
    },
    tags: { type: [String], default: [] },
    lastUpdated: { type: Date, default: Date.now }
  },
  { _id: false }
)

const openingRepertoireSchema = new Schema<OpeningRepertoireDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Name must be less than 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be less than 500 characters"]
    },
    color: {
      type: String,
      required: true,
      enum: ["white", "black"]
    },
    rootNode: {
      type: openingNodeSchema,
      required: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    metadata: {
      totalPositions: { type: Number, default: 0 },
      maxDepth: { type: Number, default: 0 },
      source: {
        type: String,
        required: true,
        enum: ["manual", "pgn_import", "lichess"],
        default: "manual"
      },
      version: { type: Number, default: 1 }
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

// Indexes for efficient querying
openingRepertoireSchema.index({ userId: 1, name: 1 })
openingRepertoireSchema.index({ isPublic: 1, tags: 1 })
openingRepertoireSchema.index({ userId: 1, color: 1 })

export const OpeningRepertoireModel = model<OpeningRepertoireDocument>("OpeningRepertoire", openingRepertoireSchema)
