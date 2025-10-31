import { Document, model, Schema } from "mongoose"
import { TrainingSession } from "@/types/opening-types"

export interface TrainingSessionDocument extends Omit<TrainingSession, "id">, Document {
  _id: string
}

const trainingSessionSchema = new Schema<TrainingSessionDocument>(
  {
    repertoireId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    currentNodeId: {
      type: String,
      required: true
    },
    movePath: {
      type: [String],
      default: []
    },
    currentFen: {
      type: String,
      required: true
    },
    isUserTurn: {
      type: Boolean,
      required: true,
      default: true
    },
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    correctMoves: {
      type: Number,
      default: 0,
      min: 0
    },
    incorrectMoves: {
      type: Number,
      default: 0,
      min: 0
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "completed", "paused"],
      default: "active"
    },
    mode: {
      type: String,
      required: true,
      enum: ["practice", "test", "review"]
    },
    settings: {
      showHints: { type: Boolean, default: true },
      allowTakebacks: { type: Boolean, default: true },
      timeLimit: { type: Number, default: 0, min: 0 },
      includeSidelines: { type: Boolean, default: false }
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
trainingSessionSchema.index({ userId: 1, status: 1 })
trainingSessionSchema.index({ repertoireId: 1, userId: 1 })
trainingSessionSchema.index({ startTime: -1 })

export const TrainingSessionModel = model<TrainingSessionDocument>("TrainingSession", trainingSessionSchema)
