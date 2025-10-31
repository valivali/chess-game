import { Document, model, Schema } from "mongoose"
import { OpeningProgress } from "@/types/opening-types"

export interface OpeningProgressDocument extends Omit<OpeningProgress, "id">, Document {
  _id: string
}

const openingProgressSchema = new Schema<OpeningProgressDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    repertoireId: {
      type: String,
      required: true,
      index: true
    },
    nodeId: {
      type: String,
      required: true
    },
    timesReviewed: {
      type: Number,
      default: 0,
      min: 0
    },
    timesCorrect: {
      type: Number,
      default: 0,
      min: 0
    },
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
      max: 4.0
    },
    nextReview: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    lastReview: {
      type: Date,
      default: Date.now
    },
    streak: {
      type: Number,
      default: 0,
      min: 0
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

// Compound indexes for efficient querying
openingProgressSchema.index({ userId: 1, repertoireId: 1, nodeId: 1 }, { unique: true })
openingProgressSchema.index({ userId: 1, nextReview: 1 })
openingProgressSchema.index({ repertoireId: 1, userId: 1 })

export const OpeningProgressModel = model<OpeningProgressDocument>("OpeningProgress", openingProgressSchema)
